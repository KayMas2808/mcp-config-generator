#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function printUsage() {
  console.log(`${colors.bright}${colors.blue}MCP Config Generator CLI${colors.reset}

${colors.bright}Commands:${colors.reset}
  ${colors.green}generate${colors.reset}    Generate UI configuration from natural language
  ${colors.green}analyze${colors.reset}     Analyze prompt and show requirements
  ${colors.green}validate${colors.reset}    Validate configuration JSON

${colors.bright}Options:${colors.reset}
  ${colors.yellow}--username${colors.reset}  Username for config (default: "obiwan")
  ${colors.yellow}--password${colors.reset}  Password for config (default: "kenobi")
  ${colors.yellow}--version${colors.reset}   Show version
  ${colors.yellow}--help${colors.reset}      Show this help

${colors.bright}Local Usage (from project directory):${colors.reset}
  ${colors.cyan}node cli.js generate "Contact form with Name, Email, Phone"${colors.reset}
  ${colors.cyan}node cli.js analyze "Student registration form"${colors.reset}
  ${colors.cyan}node cli.js validate '{"data": {...}, "username": "obiwan"}'${colors.reset}

${colors.bright}Global Usage (after npm install -g .):${colors.reset}
  ${colors.cyan}config-gen generate "Contact form with Name, Email, Phone"${colors.reset}
  ${colors.cyan}config-gen analyze "Student registration form"${colors.reset}
  ${colors.cyan}config-gen validate '{"data": {...}, "username": "obiwan"}'${colors.reset}
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    const packageJson = require('./package.json');
    console.log(`${colors.bright}MCP Config Generator v${packageJson.version}${colors.reset}`);
    process.exit(0);
  }

  const command = args[0];
  const prompt = args[1];
  
  const options = {
    username: 'obiwan',
    password: 'kenobi'
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) {
      options.username = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      options.password = args[i + 1];
      i++;
    }
  }

  return { command, prompt, options };
}

function createJsonRpcRequest(method, params, id = 1) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: id,
    method: "tools/call",
    params: {
      name: method,
      arguments: params
    }
  });
}

function callMcpTool(toolName, params) {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const lines = stdout.trim().split('\n');
        const jsonLine = lines.find(line => line.startsWith('{"result"') || line.startsWith('{"error"'));
        
        if (!jsonLine) {
          reject(new Error('No valid JSON response found'));
          return;
        }

        const response = JSON.parse(jsonLine);
        
        if (response.error) {
          reject(new Error(response.error.message || 'Unknown error'));
          return;
        }

        resolve(response.result);
      } catch (parseError) {
        reject(new Error(`Failed to parse response: ${parseError.message}`));
      }
    });

    const request = createJsonRpcRequest(toolName, params);
    child.stdin.write(request + '\n');
    child.stdin.end();
  });
}

function formatOutput(result, command) {
  if (!result || !result.content || !result.content[0]) {
    console.log(`${colors.red}Error: Invalid response format${colors.reset}`);
    return;
  }

  const content = result.content[0].text;
  
  if (command === 'generate') {
    console.log(`${colors.bright}${colors.green}✅ Configuration Generated Successfully!${colors.reset}\n`);
  } else if (command === 'analyze') {
    console.log(`${colors.bright}${colors.blue}📋 Prompt Analysis Results:${colors.reset}\n`);
  } else if (command === 'validate') {
    if (content.includes('✅')) {
      console.log(`${colors.bright}${colors.green}✅ Validation Results:${colors.reset}\n`);
    } else {
      console.log(`${colors.bright}${colors.red}❌ Validation Results:${colors.reset}\n`);
    }
  }

  console.log(content);
}

async function main() {
  try {
    const { command, prompt, options } = parseArgs();

    if (!prompt) {
      console.log(`${colors.red}Error: Missing prompt/config argument${colors.reset}`);
      printUsage();
      process.exit(1);
    }

    let toolName, params;

    switch (command) {
      case 'generate':
        toolName = 'generate_config';
        params = {
          prompt: prompt,
          username: options.username,
          password: options.password
        };
        break;

      case 'analyze':
        toolName = 'analyze_prompt';
        params = { prompt: prompt };
        break;

      case 'validate':
        toolName = 'validate_config';
        params = { config: prompt };
        break;

      default:
        console.log(`${colors.red}Error: Unknown command '${command}'${colors.reset}`);
        printUsage();
        process.exit(1);
    }

    console.log(`${colors.cyan}Processing...${colors.reset}`);
    const result = await callMcpTool(toolName, params);
    formatOutput(result, command);

  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main(); 