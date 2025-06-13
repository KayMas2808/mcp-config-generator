"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGenerator = void 0;
class ConfigGenerator {
    generateConfig(requirements) {
        const screens = this.generateScreens(requirements);
        return {
            data: {
                configName: requirements.configName,
                description: requirements.description,
                json: {
                    "app-theme": requirements.theme || "THEME_1",
                    "logo-url": requirements.logoUrl || "http://www.dummy-image-url.com/1.png",
                    "schemaVersion": "1.0",
                    screens
                }
            },
            username: "place",
            password: "holder"
        };
    }
    generateScreens(requirements) {
        const screens = [];
        // Main input screen
        const mainScreen = this.generateMainScreen(requirements);
        screens.push(mainScreen);
        // Details/Summary screen if needed
        if (requirements.hasDetailsScreen || requirements.hasPayment) {
            const detailsScreen = this.generateDetailsScreen(requirements);
            screens.push(detailsScreen);
        }
        return screens;
    }
    generateMainScreen(requirements) {
        const widgets = [];
        // Generate input widgets for each field
        requirements.fields.forEach(field => {
            const widget = this.generateInputWidget(field);
            widgets.push(widget);
        });
        // Add navigation button
        const nextButton = this.generateNextButton(requirements);
        widgets.push(nextButton);
        return {
            id: "homeScreen",
            "heading-text": this.generateHeading(requirements),
            is_main: true,
            widgets
        };
    }
    generateDetailsScreen(requirements) {
        const widgets = [];
        // Generate display widgets for each field
        requirements.fields.forEach(field => {
            const widget = this.generateDisplayWidget(field);
            widgets.push(widget);
        });
        // Add payment buttons if needed
        if (requirements.hasPayment) {
            const paymentWidget = this.generatePaymentWidget();
            widgets.push(paymentWidget);
        }
        return {
            id: "screen2",
            "heading-text": "Details",
            is_main: false,
            widgets
        };
    }
    generateInputWidget(field) {
        const inputConstraints = {
            "input-type": this.mapFieldTypeToInputType(field.type),
            minLen: field.minLength || (field.type === 'number' ? 0 : 1),
            "custom-constraint": null,
            maxLen: field.maxLength || 100,
            "input-error-message": `Enter ${field.label}`
        };
        const uiMeta = {
            "label-text": field.label,
            "input-hint": "",
            "input-constraints": inputConstraints
        };
        const targets = [{
                target: "API_TRANSACTION",
                key: `externalRefs.${field.name}`,
                type: "STORE",
                params: null,
                id: null
            }];
        return {
            id: field.name,
            type: "LABEL-INPUT",
            hidden: false,
            "ui-meta": uiMeta,
            targets
        };
    }
    generateDisplayWidget(field) {
        const uiMeta = {
            "text-left": field.label,
            "text-right": {
                value: `API_TRANSACTION.externalRefs.${field.name}`,
                type: "STORE"
            }
        };
        const targets = [];
        // If this is an amount field, also store it as txnAmount
        if (field.type === 'number' && field.name.toLowerCase().includes('amount')) {
            targets.push({
                target: "API_TRANSACTION",
                key: "txnAmount",
                type: "STORE",
                params: null,
                id: null
            });
        }
        return {
            id: field.name,
            type: "LABEL-LABEL",
            hidden: false,
            "ui-meta": uiMeta,
            targets
        };
    }
    generateNextButton(requirements) {
        const targetScreen = (requirements.hasDetailsScreen || requirements.hasPayment) ? "screen2" : null;
        const uiMeta = {
            text: {
                value: "Next",
                type: "VALUE"
            },
            cascadedOptions: {
                name: "Next"
            }
        };
        const targets = [];
        if (targetScreen) {
            targets.push({
                key: null,
                target: targetScreen,
                type: "NAVIGATION",
                params: null,
                id: null
            });
        }
        return {
            id: "next",
            type: "BUTTON",
            hidden: false,
            "ui-meta": uiMeta,
            targets
        };
    }
    generatePaymentWidget() {
        return {
            id: "paymentButtons",
            type: "PAYMENT_BUTTONS",
            hidden: false,
            "ui-meta": null,
            targets: [],
            target: null
        };
    }
    mapFieldTypeToInputType(fieldType) {
        switch (fieldType) {
            case 'number':
                return 'number';
            case 'email':
                return 'email';
            case 'phone':
                return 'tel';
            default:
                return 'string';
        }
    }
    generateHeading(requirements) {
        // Try to extract an organization name or use a default
        const defaultHeading = "DATA COLLECTION FORM";
        // Look for organization names in the config name or description
        const orgPatterns = [
            /college/i,
            /university/i,
            /school/i,
            /institute/i,
            /company/i,
            /corporation/i,
            /organization/i
        ];
        for (const pattern of orgPatterns) {
            if (pattern.test(requirements.configName) || pattern.test(requirements.description)) {
                return requirements.configName.toUpperCase().replace(/_/g, ' ');
            }
        }
        return defaultHeading;
    }
}
exports.ConfigGenerator = ConfigGenerator;
//# sourceMappingURL=generator.js.map