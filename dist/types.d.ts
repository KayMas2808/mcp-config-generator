export interface InputConstraints {
    "input-type": string;
    minLen: number;
    "custom-constraint": string | null;
    maxLen: number;
    "input-error-message": string;
}
export interface UIMeta {
    "label-text"?: string;
    "input-hint"?: string;
    "input-constraints"?: InputConstraints;
    text?: {
        value: string;
        type: string;
    };
    cascadedOptions?: {
        name: string;
    };
    "text-left"?: string;
    "text-right"?: {
        value: string;
        type: string;
    };
}
export interface Target {
    target: string;
    key: string | null;
    type: string;
    params: any;
    id: string | null;
}
export interface Widget {
    id: string;
    type: string;
    hidden: boolean;
    "ui-meta": UIMeta | null;
    targets: Target[];
    target?: any;
}
export interface Screen {
    id: string;
    "heading-text": string;
    is_main: boolean;
    widgets: Widget[];
}
export interface ConfigJSON {
    "app-theme": string;
    "logo-url": string;
    schemaVersion: string;
    screens: Screen[];
}
export interface ConfigData {
    configName: string;
    description: string;
    json: ConfigJSON;
}
export interface FullConfig {
    data: ConfigData;
    username: string;
    password: string;
}
export interface ParsedRequirement {
    fields: {
        name: string;
        type: 'string' | 'number' | 'email' | 'phone';
        label: string;
        required: boolean;
        maxLength?: number;
        minLength?: number;
    }[];
    configName: string;
    description: string;
    theme?: string;
    logoUrl?: string;
    hasDetailsScreen?: boolean;
    hasPayment?: boolean;
}
//# sourceMappingURL=types.d.ts.map