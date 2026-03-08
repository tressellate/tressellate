import { MIRROR_NODE_URLS, type HederaConfig, type MCPTool } from '../config.js';

// --- Exported functions for composition ---

export async function getTokenBalance(config: HederaConfig, accountId: string, tokenId: string) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];

    const response = await fetch(`${mirrorUrl}/accounts/${accountId}/tokens?token.id=${tokenId}`);
    const data = await response.json();
    const tokenData = data.tokens?.find((t: { token_id: string }) => t.token_id === tokenId);

    if (!tokenData) {
        return {
            accountId,
            tokenId,
            associated: false,
            balance: 0
        };
    }

    return {
        accountId,
        tokenId,
        associated: true,
        balance: tokenData.balance
    };
}

export async function getTokenTransactionHistory(
    config: HederaConfig,
    accountId: string,
    tokenId: string,
    filters?: {
        limit?: number;
        order?: string;
        timestampGte?: string;
        timestampLte?: string;
    }
) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];
    const limit = filters?.limit ?? 50;
    const order = filters?.order ?? 'desc';

    let url = `${mirrorUrl}/transactions?account.id=${accountId}&transactiontype=CRYPTOTRANSFER&limit=${limit}&order=${order}`;
    if (filters?.timestampGte) url += `&timestamp=gte:${filters.timestampGte}`;
    if (filters?.timestampLte) url += `&timestamp=lte:${filters.timestampLte}`;

    const txResponse = await fetch(url);
    const data = await txResponse.json();

    const tokenTransactions = (data.transactions ?? [])
        .filter(
            (tx: { token_transfers?: Array<{ token_id: string }> }) =>
                tx.token_transfers?.some((t: { token_id: string }) => t.token_id === tokenId)
        )
        .map(
            (tx: {
                transaction_id: string;
                consensus_timestamp: string;
                token_transfers?: Array<{ token_id: string; account: string; amount: number }>;
                memo_base64?: string;
            }) => {
                const transfer = tx.token_transfers?.find(
                    (t) => t.token_id === tokenId && t.account === accountId
                );
                return {
                    transactionId: tx.transaction_id,
                    consensusTimestamp: tx.consensus_timestamp,
                    type: transfer ? (transfer.amount > 0 ? 'RECEIVED' : 'SENT') : 'UNKNOWN',
                    amount: transfer?.amount ?? 0,
                    memo: tx.memo_base64 ? Buffer.from(tx.memo_base64, 'base64').toString() : null
                };
            }
        );

    return {
        accountId,
        tokenId,
        transactions: tokenTransactions,
        links: data.links
    };
}

export async function getTokenInfo(
    config: HederaConfig,
    tokenId: string,
    treasuryAccountId?: string
) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];

    const response = await fetch(`${mirrorUrl}/tokens/${tokenId}`);
    const data = await response.json();

    let treasuryBalance: number | null = null;
    if (treasuryAccountId) {
        const treasuryResponse = await fetch(
            `${mirrorUrl}/accounts/${treasuryAccountId}/tokens?token.id=${tokenId}`
        );
        const treasuryData = await treasuryResponse.json();
        treasuryBalance = treasuryData.tokens?.[0]?.balance ?? 0;
    }

    return {
        tokenId,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        totalSupply: data.total_supply,
        treasuryBalance,
        circulatingSupply:
            treasuryBalance !== null ? (data.total_supply ?? 0) - treasuryBalance : null,
        network: config.network,
        createdTimestamp: data.created_timestamp
    };
}

export async function checkTokenAssociation(
    config: HederaConfig,
    accountId: string,
    tokenId: string
) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];

    const response = await fetch(`${mirrorUrl}/accounts/${accountId}/tokens?token.id=${tokenId}`);
    const data = await response.json();
    const tokenData = data.tokens?.find((t: { token_id: string }) => t.token_id === tokenId);

    return {
        accountId,
        tokenId,
        associated: !!tokenData,
        balance: tokenData?.balance ?? 0
    };
}

export async function getTransactionReceipt(config: HederaConfig, transactionId: string) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];
    const txId = transactionId.replace('@', '-').replace('.', '-');

    const response = await fetch(`${mirrorUrl}/transactions/${txId}`);
    const data = await response.json();

    if (!data.transactions?.length) {
        return { success: false, error: `Transaction not found: ${transactionId}` };
    }

    const tx = data.transactions[0];
    return {
        transactionId: tx.transaction_id,
        consensusTimestamp: tx.consensus_timestamp,
        result: tx.result,
        name: tx.name,
        chargedFee: tx.charged_tx_fee,
        transfers: tx.transfers,
        tokenTransfers: tx.token_transfers,
        memo: tx.memo_base64 ? Buffer.from(tx.memo_base64, 'base64').toString() : null
    };
}

// --- MCPTool wrappers for MCP registration ---

export const HEDERA_QUERY_TOOLS: MCPTool[] = [
    {
        name: 'hedera_get_token_balance',
        description: `Gets the token balance for an account via mirror node (no network fee).
Returns the raw balance in smallest token units.`,
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Hiero account ID to query' },
                tokenId: { type: 'string', description: 'Token ID to check balance for' }
            },
            required: ['accountId', 'tokenId']
        },
        implementation: async (args, config) => {
            return getTokenBalance(config, args.accountId as string, args.tokenId as string);
        }
    },
    {
        name: 'hedera_get_token_transaction_history',
        description: `Gets token transaction history for an account via mirror node.
Returns transfers with timestamps and amounts.`,
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Hiero account ID to query' },
                tokenId: { type: 'string', description: 'Token ID to filter transactions for' },
                limit: { type: 'number', description: 'Number of transactions to return', default: 50 },
                order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
                timestampGte: { type: 'string', description: 'Filter after this ISO 8601 timestamp' },
                timestampLte: { type: 'string', description: 'Filter before this ISO 8601 timestamp' }
            },
            required: ['accountId', 'tokenId']
        },
        implementation: async (args, config) => {
            return getTokenTransactionHistory(
                config,
                args.accountId as string,
                args.tokenId as string,
                {
                    limit: args.limit as number | undefined,
                    order: args.order as string | undefined,
                    timestampGte: args.timestampGte as string | undefined,
                    timestampLte: args.timestampLte as string | undefined
                }
            );
        }
    },
    {
        name: 'hedera_get_token_info',
        description: `Gets token statistics including name, symbol, decimals, and total supply.
Optionally pass a treasury account ID to calculate circulating supply.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'Token ID to query' },
                treasuryAccountId: {
                    type: 'string',
                    description: 'Treasury account ID for circulating supply calculation (optional)'
                }
            },
            required: ['tokenId']
        },
        implementation: async (args, config) => {
            return getTokenInfo(
                config,
                args.tokenId as string,
                args.treasuryAccountId as string | undefined
            );
        }
    },
    {
        name: 'hedera_check_token_association',
        description: `Checks if an account has associated a specific token.
Returns association status and current balance.`,
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Hiero account ID to check' },
                tokenId: { type: 'string', description: 'Token ID to check association for' }
            },
            required: ['accountId', 'tokenId']
        },
        implementation: async (args, config) => {
            return checkTokenAssociation(config, args.accountId as string, args.tokenId as string);
        }
    },
    {
        name: 'hedera_get_transaction_receipt',
        description: `Gets the receipt for any Hiero transaction by transaction ID.
Used to verify operations completed successfully.`,
        inputSchema: {
            type: 'object',
            properties: {
                transactionId: {
                    type: 'string',
                    description: 'Hiero transaction ID (e.g. 0.0.12345@1705316445.000000000)'
                }
            },
            required: ['transactionId']
        },
        implementation: async (args, config) => {
            return getTransactionReceipt(config, args.transactionId as string);
        }
    }
];
