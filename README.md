# MCP Config Generator

A MCP server that generates UI configuration JSON from natural language prompts. Perfect for creating form configurations, analyzing requirements, and validating JSON structures using simple English descriptions.

This will need to be updated as more UI config JSON examples are found, or when the renderer is complete, so all possible rules and inputs are known. It is currently based on a single example I could find.

## Features

- **Natural Language Processing** - Generate UI configurations for from simple English prompts
- **CLI & MCP Integration** - Use directly in terminal or integrate with Cursor/other MCP clients
- **Configuration Validation** - Validate existing JSON configurations
- **Requirement Analysis** - Parse and analyze prompts without full generation

## Quick Start

### Installation

```bash
# Clone and install locally
git clone https://github.com/KayMas2808/mcp-config-generator.git
cd mcp-config-generator
npm install
npm run build

# For using globally in the terminal
npm install -g
```

### CLI Usage

Once installed globally, you can use the tool from anywhere:

```bash
# Generate a form configuration
config-gen generate "Create a contact form with Name, Email, and Phone"

# Analyze a prompt
config-gen analyze "Student registration form with Name, Roll Number, Amount"

# Validate a configuration
config-gen validate '{"data": {"configName": "test"}, "username": "place", "password": "holder"}'

# Get help
config-gen --help
```

### Local Usage (without global install)

```bash
# Generate a form
node cli.js generate "Create an employee form with Name, Email, Phone, Salary"

# Or use npm scripts
npm run gen "Create a form with Name and Email"
npm run analyze "Student registration form"
```

## Cursor Integration

### Step 1: Install the Package

```bash
git clone https://github.com/your-username/mcp-config-generator.git
cd mcp-config-generator
npm install
npm run build
```

### Step 2: Configure Cursor MCP Settings

1. **Open Cursor Settings** (`Cmd+,` or `Cursor → Settings`)
2. **Search for "MCP"** in the settings search
3. **Find "Mcp: Config"** section
4. **Add this configuration**:

```json
{
  "mcpServers": {
    "config-generator": {
      "command": "/opt/homebrew/bin/node", // your node path - run "which node"
      "args": ["/path/to/your/mcp-config-generator/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Step 4: Restart Cursor

After saving the configuration, restart Cursor completely for the changes to take effect.

### Step 5: Use in Cursor Chat

```
@config-generator generate a form to capture employee Name, Email, Phone, and Salary
@config-generator analyze "Create a student registration form"
@config-generator validate {"data": {...}, "username": "place", "password": "holder"}
```

## Available Commands

### CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `generate` | Generate UI configuration from prompt | `config-gen generate "Contact form with Name, Email"` |
| `analyze` | Analyze prompt and show requirements | `config-gen analyze "Student registration form"` |
| `validate` | Validate configuration JSON | `config-gen validate '{"data": {...}}'` |

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--username` | Username for configuration | `"place"` |
| `--password` | Password for configuration | `"holder"` |
| `--help` | Show help message | - |

### MCP Tools (available in Cursor)

| Tool | Description |
|------|-------------|
| `generate_config` | Generate complete UI configuration JSON |
| `analyze_prompt` | Parse requirements without full generation |
| `validate_config` | Validate configuration structure |

## Usage Examples

### Basic Form Generation

```bash
config-gen generate "Create a simple contact form with Name, Email, and Phone"
```

**Output**: Complete JSON configuration with form fields, validation, and UI structure.

### Advanced Form with Custom Settings

```bash
config-gen generate "Student registration form with Name, Roll Number, Email, and Fee Amount" --username admin --password secret123
```

### Requirement Analysis

```bash
config-gen analyze "Create a conference registration form with Name, Email, Company, and Registration Fee"
```

**Output**: Detailed breakdown of detected fields, validation rules, and form structure.

### Configuration Validation

```bash
config-gen validate '{"data": {"configName": "test_form", "json": {...}}, "username": "place", "password": "holder"}'
```

## Development

### Local Development Setup

```bash
git clone https://github.com/KayMas2808/mcp-config-generator.git
cd mcp-config-generator
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Test CLI
npm run cli --help
```

### Project Structure

```
mcp-config-generator/
├── src/
│   ├── index.ts          # MCP server implementation
│   ├── generator.ts      # Configuration generation logic
│   ├── parser.ts         # Natural language parsing
│   └── types.ts          # Type definitions
├── dist/                 # Compiled JavaScript
├── cli.js               # CLI interface
├── examples/            # Example prompts and configurations
└── package.json
```

## Requirements

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

## Troubleshooting

### Common Issues

**"0 tools enabled" in Cursor:**
- Ensure Node.js path is absolute in MCP configuration
- Verify the project is built (`npm run build`)
- Restart Cursor after configuration changes

**CLI command not found:**
- Install globally: `npm install -g mcp-config-generator`
- Or use local: `npm run cli` or `node cli.js`

**Permission errors:**
- Make CLI executable: `chmod +x cli.js`
- Check Node.js permissions

### Getting Help

```bash
# Show detailed help
config-gen --help

# Check version
config-gen --version
```