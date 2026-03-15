import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Tressellate Test Client
 * 
 * Usage:
 * bun test-server <path-to-server-entrypoint>
 * 
 * Example:
 * bun test-server ../servers/crop-cert/dist/index.js
 */

const serverPath = process.argv[2];

if (!serverPath) {
    console.error('Error: Please provide a path to the server entrypoint.');
    console.error('Example: bun test-server ../servers/crop-cert/dist/index.js');
    process.exit(1);
}

// Ensure the required dummy environment variables are provided to prevent crash
const TEST_ENV = {
    ...process.env,
    HEDERA_NETWORK: process.env.HEDERA_NETWORK || 'testnet',
    HEDERA_OPERATOR_ID: process.env.HEDERA_OPERATOR_ID || '0.0.12345',
    HEDERA_OPERATOR_KEY: process.env.HEDERA_OPERATOR_KEY || '302e020100300506032b6570042204201111111111111111111111111111111111111111111111111111111111111111',
    HEDERA_SUPPLY_KEY: process.env.HEDERA_SUPPLY_KEY || '302e020100300506032b6570042204202222222222222222222222222222222222222222222222222222222222222222',
};

const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    env: TEST_ENV
});

const client = new Client(
    { name: 'tressellate-test-client', version: '1.0.0' },
    { capabilities: {} }
);

async function run() {
    console.log(`Connecting to MCP server at: ${serverPath}...`);
    await client.connect(transport);
    console.log("Connected successfully!\n");

    console.log("Requesting tool list...");
    const response = await client.listTools();

    console.log(`\nSuccess! Found ${response.tools.length} available tools:`);
    response.tools.forEach(tool => {
        console.log(` - ${tool.name}: ${tool.description?.split('\\n')[0].substring(0, 70)}...`);
    });

    console.log("\nThe server is healthy and accepting MCP protocol connections.");
    process.exit(0);
}

run().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
