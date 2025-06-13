#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const parser_js_1 = require("./parser.js");
const generator_js_1 = require("./generator.js");
class ConfigGeneratorServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'mcp-config-generator',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.parser = new parser_js_1.PromptParser();
        this.generator = new generator_js_1.ConfigGenerator();
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'generate_config',
                        description: 'Generate a valid UI configuration JSON from a natural language prompt describing the desired form fields and behavior',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                prompt: {
                                    type: 'string',
                                    description: 'Natural language description of the UI configuration needed (e.g., "Create a form to capture Name, Roll Number, and Amount")'
                                },
                                username: {
                                    type: 'string',
                                    description: 'Username for the configuration (optional, defaults to "place")',
                                    default: 'place'
                                },
                                password: {
                                    type: 'string',
                                    description: 'Password for the configuration (optional, defaults to "holder")',
                                    default: 'holder'
                                }
                            },
                            required: ['prompt'],
                        },
                    },
                    {
                        name: 'analyze_prompt',
                        description: 'Analyze a natural language prompt and return the parsed requirements without generating the full JSON configuration',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                prompt: {
                                    type: 'string',
                                    description: 'Natural language description to analyze'
                                }
                            },
                            required: ['prompt'],
                        },
                    },
                    {
                        name: 'validate_config',
                        description: 'Validate a configuration JSON to ensure it matches the expected schema',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                config: {
                                    type: 'string',
                                    description: 'JSON string of the configuration to validate'
                                }
                            },
                            required: ['config'],
                        },
                    }
                ],
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'generate_config':
                        return await this.handleGenerateConfig(args);
                    case 'analyze_prompt':
                        return await this.handleAnalyzePrompt(args);
                    case 'validate_config':
                        return await this.handleValidateConfig(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${errorMessage}`,
                        },
                    ],
                };
            }
        });
    }
    async handleGenerateConfig(args) {
        const { prompt, username = 'place', password = 'holder' } = args;
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Prompt is required and must be a string');
        }
        // Parse the natural language prompt
        const requirements = this.parser.parsePrompt(prompt);
        // Generate the configuration
        let config = this.generator.generateConfig(requirements);
        // Override username and password if provided
        config.username = username;
        config.password = password;
        const jsonOutput = JSON.stringify(config, null, 2);
        return {
            content: [
                {
                    type: 'text',
                    text: `Generated configuration JSON:\n\`\`\`json\n${jsonOutput}\n\`\`\`\n\n**Parsed Requirements:**\n- Configuration Name: ${requirements.configName}\n- Description: ${requirements.description}\n- Fields: ${requirements.fields.map(f => `${f.label} (${f.type})`).join(', ')}\n- Has Details Screen: ${requirements.hasDetailsScreen}\n- Has Payment: ${requirements.hasPayment}`,
                },
            ],
        };
    }
    async handleAnalyzePrompt(args) {
        const { prompt } = args;
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Prompt is required and must be a string');
        }
        const requirements = this.parser.parsePrompt(prompt);
        return {
            content: [
                {
                    type: 'text',
                    text: `**Analyzed Requirements:**\n\n- **Configuration Name:** ${requirements.configName}\n- **Description:** ${requirements.description}\n- **Theme:** ${requirements.theme}\n- **Logo URL:** ${requirements.logoUrl}\n- **Has Details Screen:** ${requirements.hasDetailsScreen}\n- **Has Payment:** ${requirements.hasPayment}\n\n**Detected Fields:**\n${requirements.fields.map(f => `- **${f.label}** (${f.type}): Required=${f.required}, MaxLength=${f.maxLength}`).join('\n')}`,
                },
            ],
        };
    }
    async handleValidateConfig(args) {
        const { config } = args;
        if (!config || typeof config !== 'string') {
            throw new Error('Config is required and must be a JSON string');
        }
        try {
            const parsedConfig = JSON.parse(config);
            const validationResult = this.validateConfigStructure(parsedConfig);
            if (validationResult.isValid) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `✅ **Configuration is valid!**\n\n**Summary:**\n- Configuration Name: ${parsedConfig.data?.configName || 'N/A'}\n- Schema Version: ${parsedConfig.data?.json?.schemaVersion || 'N/A'}\n- Number of Screens: ${parsedConfig.data?.json?.screens?.length || 0}\n- Total Widgets: ${this.countWidgets(parsedConfig)}\n\n**Structure Validation Passes:**\n${validationResult.details.map(d => `✅ ${d}`).join('\n')}`,
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ **Configuration is invalid!**\n\n**Issues Found:**\n${validationResult.errors.map(e => `❌ ${e}`).join('\n')}\n\n**Valid Checks:**\n${validationResult.details.map(d => `✅ ${d}`).join('\n')}`,
                        },
                    ],
                };
            }
        }
        catch (parseError) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ **Invalid JSON format!**\n\nError: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}\n\nPlease ensure the configuration is valid JSON.`,
                    },
                ],
            };
        }
    }
    validateConfigStructure(config) {
        const errors = [];
        const details = [];
        // Check top-level structure
        if (!config.data) {
            errors.push('Missing "data" property');
        }
        else {
            details.push('Has "data" property');
        }
        if (!config.username) {
            errors.push('Missing "username" property');
        }
        else {
            details.push('Has "username" property');
        }
        if (!config.password) {
            errors.push('Missing "password" property');
        }
        else {
            details.push('Has "password" property');
        }
        // Check data structure
        if (config.data) {
            if (!config.data.configName) {
                errors.push('Missing "data.configName" property');
            }
            else {
                details.push('Has configuration name');
            }
            if (!config.data.json) {
                errors.push('Missing "data.json" property');
            }
            else {
                details.push('Has JSON configuration');
                // Check json structure
                const json = config.data.json;
                if (!json.schemaVersion) {
                    errors.push('Missing "schemaVersion"');
                }
                else {
                    details.push('Has schema version');
                }
                if (!json.screens || !Array.isArray(json.screens)) {
                    errors.push('Missing or invalid "screens" array');
                }
                else {
                    details.push(`Has ${json.screens.length} screens`);
                    // Check each screen
                    json.screens.forEach((screen, index) => {
                        if (!screen.id) {
                            errors.push(`Screen ${index} missing "id"`);
                        }
                        if (!screen.widgets || !Array.isArray(screen.widgets)) {
                            errors.push(`Screen ${index} missing or invalid "widgets" array`);
                        }
                        else {
                            details.push(`Screen ${index} has ${screen.widgets.length} widgets`);
                        }
                    });
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            details
        };
    }
    countWidgets(config) {
        if (!config.data?.json?.screens)
            return 0;
        return config.data.json.screens.reduce((total, screen) => {
            return total + (screen.widgets?.length || 0);
        }, 0);
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('MCP Config Generator Server running on stdio');
    }
}
const server = new ConfigGeneratorServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map