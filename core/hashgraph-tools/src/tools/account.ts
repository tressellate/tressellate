import { AccountCreateTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';
import { buildClient, MIRROR_NODE_URLS, type HederaConfig, type MCPTool } from '../config.js';

// --- Exported functions for composition ---

export async function createAccount(
    config: HederaConfig,
    opts: { initialBalance?: number; memo?: string }
) {
    const client = buildClient(config);
    const newKey = PrivateKey.generateED25519();

    const response = await new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setInitialBalance(new Hbar(opts.initialBalance ?? 0.1))
        .setAccountMemo(opts.memo ?? '')
        .execute(client);

    const receipt = await response.getReceipt(client);

    return {
        success: true,
        accountId: receipt.accountId!.toString(),
        publicKey: newKey.publicKey.toString(),
        privateKey: newKey.toString()
    };
}

export async function getAccountInfo(config: HederaConfig, accountId: string) {
    const mirrorUrl = config.mirrorNodeUrl || MIRROR_NODE_URLS[config.network];

    const response = await fetch(`${mirrorUrl}/accounts/${accountId}`);
    if (!response.ok) {
        throw new Error(`Account not found: ${accountId}`);
    }

    const data = await response.json();

    const tokenResponse = await fetch(`${mirrorUrl}/accounts/${accountId}/tokens`);
    const tokenData = await tokenResponse.json();

    return {
        accountId,
        balance: {
            hbar: data.balance?.balance ? (data.balance.balance / 100_000_000).toFixed(8) : '0',
            tinybar: data.balance?.balance ?? 0
        },
        key: data.key,
        memo: data.memo,
        autoRenewPeriod: data.auto_renew_period,
        createdTimestamp: data.created_timestamp,
        tokens:
            tokenData.tokens?.map(
                (t: { token_id: string; balance: number; freeze_status: string }) => ({
                    tokenId: t.token_id,
                    balance: t.balance,
                    freezeStatus: t.freeze_status
                })
            ) ?? [],
        isDeleted: data.deleted ?? false
    };
}

// --- MCPTool wrappers for MCP registration ---

export const HEDERA_ACCOUNT_TOOLS: MCPTool[] = [
    {
        name: 'hedera_create_account',
        description: `Creates a new Hiero account with an ED25519 key pair.
Platform pays the account creation fee.
Returns accountId and private key — the private key must be stored securely.`,
        inputSchema: {
            type: 'object',
            properties: {
                initialBalance: {
                    type: 'number',
                    description: 'Initial HBAR balance (minimum 0.01)',
                    default: 0.1
                },
                memo: { type: 'string', description: 'Account memo for identification' }
            },
            required: []
        },
        implementation: async (args, config) => {
            return createAccount(config, {
                initialBalance: args.initialBalance as number | undefined,
                memo: args.memo as string | undefined
            });
        }
    },
    {
        name: 'hedera_get_account_info',
        description: `Gets Hiero account information including HBAR balance,
token associations, and account status via mirror node.`,
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Hiero account ID (e.g. 0.0.12345)' }
            },
            required: ['accountId']
        },
        implementation: async (args, config) => {
            return getAccountInfo(config, args.accountId as string);
        }
    }
];
