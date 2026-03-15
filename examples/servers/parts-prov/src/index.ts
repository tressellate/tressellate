import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import type { MCPTool } from '@tressellate/core/config';
import { HEDERA_TOOLS } from '@tressellate/core';
import { PARTS_PROV_TOOLS, type PartsProvConfig } from '@tressellate/parts-prov';

const ALL_TOOLS: MCPTool<PartsProvConfig>[] = [
	...(HEDERA_TOOLS as MCPTool<PartsProvConfig>[]),
	...PARTS_PROV_TOOLS
];

const config: PartsProvConfig = {
	network: (process.env.HEDERA_NETWORK as PartsProvConfig['network']) ?? 'testnet',
	operatorAccountId: process.env.HEDERA_OPERATOR_ID!,
	operatorPrivateKey: process.env.HEDERA_OPERATOR_KEY!,
	supplyKey: process.env.HEDERA_SUPPLY_KEY!,
	partsCollectionId: process.env.HEDERA_PARTS_COLLECTION_ID,
	partsAuditTopicId: process.env.HEDERA_PARTS_AUDIT_TOPIC_ID,
	mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL
};

const server = new Server(
	{ name: 'Hedera Parts Provenance MCP', version: '1.0.0' },
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
