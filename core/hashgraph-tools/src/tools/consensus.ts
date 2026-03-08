import {
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    TopicId,
    PrivateKey
} from '@hashgraph/sdk';
import { buildClient, MIRROR_NODE_URLS, type HederaConfig, type MCPTool } from '../config.js';

// --- Exported functions for composition ---

export async function createTopic(
    config: HederaConfig,
    opts: { topicMemo?: string; adminKeyEnabled?: boolean }
) {
    const client = buildClient(config);
    const operatorKey = PrivateKey.fromString(config.operatorPrivateKey);

    let tx = new TopicCreateTransaction().setTopicMemo(opts.topicMemo ?? '');

    if (opts.adminKeyEnabled !== false) {
        tx = tx.setAdminKey(operatorKey.publicKey).setSubmitKey(operatorKey.publicKey);
    }

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);

    return {
        success: true,
        topicId: receipt.topicId!.toString()
    };
}

export async function submitTopicMessage(
    config: HederaConfig,
    topicId: string,
    message: Record<string, unknown> | string
) {
    const client = buildClient(config);
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);

    const response = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(messageString)
        .execute(client);

    const receipt = await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString(),
        consensusTimestamp: receipt.topicSequenceNumber?.toString(),
        topicSequenceNumber: receipt.topicSequenceNumber?.toNumber()
    };
}

export async function getTopicMessages(
    config: HederaConfig,
    topicId: string,
    filters?: {
        sequenceNumberGte?: number;
        sequenceNumberLte?: number;
        timestampGte?: string;
        timestampLte?: string;
        limit?: number;
        order?: string;
    }
) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];
    const params = new URLSearchParams();

    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.order) params.set('order', filters.order);
    if (filters?.sequenceNumberGte) params.set('sequencenumber', `gte:${filters.sequenceNumberGte}`);
    if (filters?.sequenceNumberLte) params.set('sequencenumber', `lte:${filters.sequenceNumberLte}`);
    if (filters?.timestampGte) params.set('timestamp', `gte:${filters.timestampGte}`);
    if (filters?.timestampLte) params.set('timestamp', `lte:${filters.timestampLte}`);

    const url = `${mirrorUrl}/topics/${topicId}/messages?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    const messages = (data.messages ?? []).map(
        (msg: { consensus_timestamp: string; sequence_number: number; message: string }) => {
            let decoded: unknown;
            try {
                decoded = JSON.parse(Buffer.from(msg.message, 'base64').toString());
            } catch {
                decoded = Buffer.from(msg.message, 'base64').toString();
            }
            return {
                consensusTimestamp: msg.consensus_timestamp,
                sequenceNumber: msg.sequence_number,
                message: decoded
            };
        }
    );

    return {
        topicId,
        messages,
        count: messages.length,
        links: data.links
    };
}

// --- MCPTool wrappers for MCP registration ---

export const HEDERA_CONSENSUS_TOOLS: MCPTool[] = [
    {
        name: 'hedera_create_topic',
        description: `Creates a Hiero Consensus Service (HCS) topic.
Returns the topic ID for use in subsequent message operations.`,
        inputSchema: {
            type: 'object',
            properties: {
                topicMemo: { type: 'string', description: 'Memo identifying this topic' },
                adminKeyEnabled: {
                    type: 'boolean',
                    description: 'Whether to set admin key (allows topic modification)',
                    default: true
                }
            },
            required: []
        },
        implementation: async (args, config) => {
            return createTopic(config, {
                topicMemo: args.topicMemo as string | undefined,
                adminKeyEnabled: args.adminKeyEnabled as boolean | undefined
            });
        }
    },
    {
        name: 'hedera_submit_topic_message',
        description: `Submits a message to an HCS topic.
Messages are immutably recorded with a consensus timestamp.`,
        inputSchema: {
            type: 'object',
            properties: {
                topicId: { type: 'string', description: 'HCS topic ID (e.g. 0.0.12345)' },
                message: {
                    type: 'object',
                    description: 'Message payload (will be JSON serialized)'
                }
            },
            required: ['topicId', 'message']
        },
        implementation: async (args, config) => {
            return submitTopicMessage(
                config,
                args.topicId as string,
                args.message as Record<string, unknown>
            );
        }
    },
    {
        name: 'hedera_get_topic_messages',
        description: `Retrieves messages from an HCS topic via mirror node.
Supports filtering by sequence number or timestamp range.`,
        inputSchema: {
            type: 'object',
            properties: {
                topicId: { type: 'string', description: 'HCS topic ID to query' },
                sequenceNumberGte: { type: 'number', description: 'Messages with sequence number >= this value' },
                sequenceNumberLte: { type: 'number', description: 'Messages with sequence number <= this value' },
                timestampGte: { type: 'string', description: 'Messages at or after this ISO 8601 timestamp' },
                timestampLte: { type: 'string', description: 'Messages at or before this ISO 8601 timestamp' },
                limit: { type: 'number', description: 'Maximum messages to return', default: 100 },
                order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
            },
            required: ['topicId']
        },
        implementation: async (args, config) => {
            return getTopicMessages(config, args.topicId as string, {
                sequenceNumberGte: args.sequenceNumberGte as number | undefined,
                sequenceNumberLte: args.sequenceNumberLte as number | undefined,
                timestampGte: args.timestampGte as string | undefined,
                timestampLte: args.timestampLte as string | undefined,
                limit: args.limit as number | undefined,
                order: args.order as string | undefined
            });
        }
    }
];
