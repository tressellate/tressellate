import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    TokenBurnTransaction,
    TokenAssociateTransaction,
    TokenId,
    AccountId,
    PrivateKey
} from '@hashgraph/sdk';
import { buildClient, type HederaConfig, type MCPTool } from '../config.js';

// --- Exported functions for composition ---

export async function createToken(
    config: HederaConfig,
    opts: {
        tokenName?: string;
        tokenSymbol?: string;
        decimals?: number;
        initialSupply?: number;
        memo?: string;
        tokenType?: TokenType;
        supplyType?: TokenSupplyType;
    }
) {
    const client = buildClient(config);
    const supplyKey = PrivateKey.fromString(config.supplyKey);
    const operatorKey = PrivateKey.fromString(config.operatorPrivateKey);

    const tx = await new TokenCreateTransaction()
        .setTokenName(opts.tokenName ?? 'Token')
        .setTokenSymbol(opts.tokenSymbol ?? 'TKN')
        .setDecimals(opts.decimals ?? 0)
        .setInitialSupply(opts.initialSupply ?? 0)
        .setTokenType(opts.tokenType ?? TokenType.FungibleCommon)
        .setSupplyType(opts.supplyType ?? TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey.publicKey)
        .setAdminKey(operatorKey.publicKey)
        .setFreezeKey(operatorKey.publicKey)
        .setTokenMemo(opts.memo ?? '')
        .setTreasuryAccountId(AccountId.fromString(config.operatorAccountId))
        .freezeWith(client)
        .sign(operatorKey);

    const receipt = await tx.execute(client).then((r) => r.getReceipt(client));

    return {
        success: true,
        tokenId: receipt.tokenId!.toString()
    };
}

export async function mintToken(config: HederaConfig, tokenId: string, amount: number) {
    const client = buildClient(config);
    const supplyKey = PrivateKey.fromString(config.supplyKey);

    const tx = await new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setAmount(amount)
        .freezeWith(client)
        .sign(supplyKey);

    const response = await tx.execute(client);
    await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString()
    };
}

export async function transferToken(
    config: HederaConfig,
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number
) {
    const client = buildClient(config);
    const operatorKey = PrivateKey.fromString(config.operatorPrivateKey);

    const tx = await new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromAccountId), -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), amount)
        .freezeWith(client)
        .sign(operatorKey);

    const response = await tx.execute(client);
    await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString()
    };
}

export async function burnToken(config: HederaConfig, tokenId: string, amount: number) {
    const client = buildClient(config);
    const supplyKey = PrivateKey.fromString(config.supplyKey);

    const tx = await new TokenBurnTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setAmount(amount)
        .freezeWith(client)
        .sign(supplyKey);

    const response = await tx.execute(client);
    await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString()
    };
}

export async function associateToken(
    config: HederaConfig,
    tokenId: string,
    accountId: string,
    accountPrivateKey?: string
) {
    const client = buildClient(config);

    const tx = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([TokenId.fromString(tokenId)]);

    const signingKey = accountPrivateKey
        ? PrivateKey.fromString(accountPrivateKey)
        : PrivateKey.fromString(config.operatorPrivateKey);

    const signedTx = await tx.freezeWith(client).sign(signingKey);
    const response = await signedTx.execute(client);
    await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString(),
        accountId,
        tokenId
    };
}

// --- MCPTool wrappers for MCP registration ---

export const HEDERA_TOKEN_TOOLS: MCPTool[] = [
    {
        name: 'hedera_create_token',
        description: `Creates a fungible token on Hiero Token Service.
Returns the token ID for use in subsequent operations.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenName: { type: 'string', description: 'Full name of the token' },
                tokenSymbol: { type: 'string', description: 'Token ticker symbol' },
                decimals: { type: 'number', description: 'Decimal places (e.g. 2 = minimum unit of 0.01)' },
                initialSupply: { type: 'number', description: 'Initial supply in smallest units (0 for none)' },
                memo: { type: 'string', description: 'Token memo for identification' }
            },
            required: []
        },
        implementation: async (args, config) => {
            return createToken(config, {
                tokenName: args.tokenName as string | undefined,
                tokenSymbol: args.tokenSymbol as string | undefined,
                decimals: args.decimals as number | undefined,
                initialSupply: args.initialSupply as number | undefined,
                memo: args.memo as string | undefined
            });
        }
    },
    {
        name: 'hedera_mint_token',
        description: `Mints additional supply of a fungible token to the treasury account.
Requires the supply key configured in the server.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'Token ID to mint (e.g. 0.0.12345)' },
                amount: { type: 'number', description: 'Amount to mint in smallest token units' }
            },
            required: ['tokenId', 'amount']
        },
        implementation: async (args, config) => {
            return mintToken(config, args.tokenId as string, args.amount as number);
        }
    },
    {
        name: 'hedera_transfer_token',
        description: `Transfers tokens between two Hiero accounts.
Both accounts must have the token associated before transfer.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'Token ID to transfer' },
                fromAccountId: { type: 'string', description: 'Sender account ID' },
                toAccountId: { type: 'string', description: 'Recipient account ID' },
                amount: { type: 'number', description: 'Amount in smallest token units' }
            },
            required: ['tokenId', 'fromAccountId', 'toAccountId', 'amount']
        },
        implementation: async (args, config) => {
            return transferToken(
                config,
                args.tokenId as string,
                args.fromAccountId as string,
                args.toAccountId as string,
                args.amount as number
            );
        }
    },
    {
        name: 'hedera_burn_token',
        description: `Burns tokens from the treasury account, permanently reducing total supply.
Requires the supply key configured in the server.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'Token ID to burn' },
                amount: { type: 'number', description: 'Amount to burn in smallest token units' }
            },
            required: ['tokenId', 'amount']
        },
        implementation: async (args, config) => {
            return burnToken(config, args.tokenId as string, args.amount as number);
        }
    },
    {
        name: 'hedera_associate_token',
        description: `Associates a token with a Hiero account.
Must be called before the account can receive the token.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'Token ID to associate' },
                accountId: { type: 'string', description: 'Account ID to associate with the token' },
                accountPrivateKey: {
                    type: 'string',
                    description: 'Private key of the account (uses operator key if omitted)'
                }
            },
            required: ['tokenId', 'accountId']
        },
        implementation: async (args, config) => {
            return associateToken(
                config,
                args.tokenId as string,
                args.accountId as string,
                args.accountPrivateKey as string | undefined
            );
        }
    }
];
