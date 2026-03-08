import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import type { MCPTool } from '@trellis-mcp/core/config';
import { HEDERA_TOOLS } from '@trellis-mcp/core';
import { REC_TOOLS, type RECConfig } from '@trellis-mcp/rec';

const ALL_TOOLS: MCPTool<RECConfig>[] = [
	...(HEDERA_TOOLS as MCPTool<RECConfig>[]),
	...REC_TOOLS
];

const config: RECConfig = {
	network: (process.env.HEDERA_NETWORK as RECConfig['network']) ?? 'testnet',
	operatorAccountId: process.env.HEDERA_OPERATOR_ID!,
	operatorPrivateKey: process.env.HEDERA_OPERATOR_KEY!,
	supplyKey: process.env.HEDERA_SUPPLY_KEY!,
	recTokenId: process.env.HEDERA_REC_TOKEN_ID,
	recCertCollectionId: process.env.HEDERA_REC_CERT_COLLECTION_ID,
	recAuditTopicId: process.env.HEDERA_REC_AUDIT_TOPIC_ID,
	mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL
};

const server = new Server(
	{ name: 'Hedera REC MCP', version: '1.0.0' },
	{ capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: ALL_TOOLS.map((tool) => ({
		name: tool.name,
		description: tool.description,
		inputSchema: tool.inputSchema
	}))
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const tool = ALL_TOOLS.find((t) => t.name === request.params.name);

	if (!tool) {
		throw new Error(`Tool not found: ${request.params.name}`);
	}

	try {
		const result = await tool.implementation(
			(request.params.arguments ?? {}) as Record<string, unknown>,
			config
		);
		return {
			content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
		};
	} catch (error) {
		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
							tool: request.params.name,
							network: config.network
						},
						null,
						2
					)
				}
			],
			isError: true
		};
	}
});

const transport = new StdioServerTransport();
await server.connect(transport);
