import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    TokenBurnTransaction,
    NftId,
    TokenId,
    AccountId,
    PrivateKey
} from '@hashgraph/sdk';
import { buildClient, MIRROR_NODE_URLS, type HederaConfig, type MCPTool } from '../config.js';

// --- Exported functions for composition ---

export async function createNFTCollection(
    config: HederaConfig,
    opts: {
        tokenName?: string;
        tokenSymbol?: string;
        maxSupply?: number;
        memo?: string;
    }
) {
    const client = buildClient(config);
    const supplyKey = PrivateKey.fromString(config.supplyKey);
    const operatorKey = PrivateKey.fromString(config.operatorPrivateKey);

    const tx = new TokenCreateTransaction()
        .setTokenName(opts.tokenName ?? 'NFT Collection')
        .setTokenSymbol(opts.tokenSymbol ?? 'NFT')
        .setDecimals(0)
        .setInitialSupply(0)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(opts.maxSupply ? TokenSupplyType.Finite : TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey.publicKey)
        .setAdminKey(operatorKey.publicKey)
        .setFreezeKey(operatorKey.publicKey)
        .setTokenMemo(opts.memo ?? '')
        .setTreasuryAccountId(AccountId.fromString(config.operatorAccountId));

    if (opts.maxSupply) {
        tx.setMaxSupply(opts.maxSupply);
    }

    const signedTx = await tx.freezeWith(client).sign(operatorKey);
    const receipt = await signedTx.execute(client).then((r) => r.getReceipt(client));

    return {
        success: true,
        tokenId: receipt.tokenId!.toString()
    };
}

export async function mintNFT(
    config: HederaConfig,
    tokenId: string,
    metadata: string[]
) {
    const client = buildClient(config);
    const supplyKey = PrivateKey.fromString(config.supplyKey);

    const metadataBuffers = metadata.map((m) => Buffer.from(m));

    const tx = await new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setMetadata(metadataBuffers)
        .freezeWith(client)
        .sign(supplyKey);

    const response = await tx.execute(client);
    const receipt = await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString(),
        serialNumbers: receipt.serials.map((s) => s.toNumber())
    };
}

export async function transferNFT(
    config: HederaConfig,
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    serialNumber: number
) {
    const client = buildClient(config);
    const operatorKey = PrivateKey.fromString(config.operatorPrivateKey);

    const nftId = new NftId(TokenId.fromString(tokenId), serialNumber);

    const tx = await new TransferTransaction()
        .addNftTransfer(nftId, AccountId.fromString(fromAccountId), AccountId.fromString(toAccountId))
        .freezeWith(client)
        .sign(operatorKey);

    const response = await tx.execute(client);
    await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString()
    };
}

export async function burnNFT(
    config: HederaConfig,
    tokenId: string,
    serialNumbers: number[]
) {
    const client = buildClient(config);
    const supplyKey = PrivateKey.fromString(config.supplyKey);

    const Long = { fromNumber: (n: number) => n as unknown as import('@hashgraph/sdk').Long };

    const tx = await new TokenBurnTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setSerials(serialNumbers.map((s) => Long.fromNumber(s)))
        .freezeWith(client)
        .sign(supplyKey);

    const response = await tx.execute(client);
    await response.getReceipt(client);

    return {
        success: true,
        transactionId: response.transactionId.toString(),
        burnedSerials: serialNumbers
    };
}

export async function getNFTInfo(
    config: HederaConfig,
    tokenId: string,
    serialNumber: number
) {
    const baseUrl = config.mirrorNodeUrl ?? MIRROR_NODE_URLS[config.network];
    const url = `${baseUrl}/tokens/${tokenId}/nfts/${serialNumber}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Mirror node error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let decodedMetadata: string | null = null;
    if (data.metadata) {
        try {
            decodedMetadata = Buffer.from(data.metadata, 'base64').toString('utf-8');
        } catch {
            decodedMetadata = data.metadata;
        }
    }

    return {
        tokenId: data.token_id,
        serialNumber: data.serial_number,
        accountId: data.account_id,
        metadata: decodedMetadata,
        metadataRaw: data.metadata,
        createdTimestamp: data.created_timestamp,
        modifiedTimestamp: data.modified_timestamp,
        deleted: data.deleted,
        spender: data.spender
    };
}

export async function getAccountNFTs(
    config: HederaConfig,
    accountId: string,
    tokenId?: string
) {
    const baseUrl = config.mirrorNodeUrl ?? MIRROR_NODE_URLS[config.network];
    let url = `${baseUrl}/accounts/${accountId}/nfts`;
    if (tokenId) {
        url += `?token.id=${tokenId}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Mirror node error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const nfts = (data.nfts ?? []).map((nft: Record<string, unknown>) => {
        let decodedMetadata: string | null = null;
        if (nft.metadata) {
            try {
                decodedMetadata = Buffer.from(nft.metadata as string, 'base64').toString('utf-8');
            } catch {
                decodedMetadata = nft.metadata as string;
            }
        }
        return {
            tokenId: nft.token_id,
            serialNumber: nft.serial_number,
            metadata: decodedMetadata,
            metadataRaw: nft.metadata,
            createdTimestamp: nft.created_timestamp,
            spender: nft.spender
        };
    });

    return {
        accountId,
        nfts,
        links: data.links
    };
}

export async function verifyContractHolder(
    config: HederaConfig,
    opts: {
        tokenId: string;
        accountId: string;
        contractType: string;
        projectId?: string;
        checkExpiry?: boolean;
    }
) {
    const { tokenId, accountId, contractType, projectId, checkExpiry = true } = opts;

    const nftsResult = await getAccountNFTs(config, accountId, tokenId);

    if (!nftsResult.nfts || nftsResult.nfts.length === 0) {
        return {
            accountId,
            contractType,
            hasAccess: false,
            reason: `Account does not hold any NFTs from collection ${tokenId}`
        };
    }

    const now = new Date();

    for (const nft of nftsResult.nfts) {
        if (!nft.metadata) continue;
        try {
            const meta = JSON.parse(nft.metadata);

            if (meta.type !== contractType) continue;
            if (projectId && meta.projectId !== projectId) continue;

            if (checkExpiry && meta.expiresAt) {
                const expiresAt = new Date(meta.expiresAt);
                if (expiresAt < now) {
                    return {
                        accountId,
                        contractType,
                        projectId: meta.projectId,
                        hasAccess: false,
                        reason: 'Contract has expired',
                        serialNumber: nft.serialNumber,
                        expiresAt: meta.expiresAt,
                        termsHash: meta.termsHash,
                        version: meta.version
                    };
                }
            }

            return {
                accountId,
                contractType,
                projectId: meta.projectId,
                hasAccess: true,
                serialNumber: nft.serialNumber,
                grantedAt: meta.grantedAt,
                expiresAt: meta.expiresAt,
                termsHash: meta.termsHash,
                version: meta.version,
                metadata: meta
            };
        } catch {
            continue;
        }
    }

    return {
        accountId,
        contractType,
        projectId,
        hasAccess: false,
        reason: `No valid ${contractType} contract found${projectId ? ` for project ${projectId}` : ''}`,
        totalNFTsChecked: nftsResult.nfts.length
    };
}

// --- MCPTool wrappers for MCP registration ---

export const HEDERA_NFT_TOOLS: MCPTool[] = [
    {
        name: 'hedera_create_nft_collection',
        description: `Creates a Non-Fungible Token (NFT) collection on Hiero Token Service.
Each minted NFT in the collection is unique with its own serial number and metadata.
Returns the token ID for use in subsequent NFT operations.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenName: { type: 'string', description: 'Name of the NFT collection' },
                tokenSymbol: { type: 'string', description: 'Symbol for the collection (e.g. BNDA)' },
                maxSupply: { type: 'number', description: 'Maximum NFTs that can be minted (omit for unlimited)' },
                memo: { type: 'string', description: 'Collection memo/description' }
            },
            required: []
        },
        implementation: async (args, config) => {
            return createNFTCollection(config, {
                tokenName: args.tokenName as string | undefined,
                tokenSymbol: args.tokenSymbol as string | undefined,
                maxSupply: args.maxSupply as number | undefined,
                memo: args.memo as string | undefined
            });
        }
    },
    {
        name: 'hedera_mint_nft',
        description: `Mints one or more NFTs in a collection. Each NFT gets a unique serial number.
Metadata is stored on-chain as base64-encoded strings (max 100 bytes each).
Returns the serial numbers of newly minted NFTs.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'NFT collection token ID (e.g. 0.0.12345)' },
                metadata: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of metadata strings — one NFT minted per entry. Can be JSON, IPFS CID, or any string.'
                }
            },
            required: ['tokenId', 'metadata']
        },
        implementation: async (args, config) => {
            return mintNFT(config, args.tokenId as string, args.metadata as string[]);
        }
    },
    {
        name: 'hedera_transfer_nft',
        description: `Transfers a specific NFT (by serial number) between two Hiero accounts.
Both accounts must have the NFT collection token associated.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'NFT collection token ID' },
                fromAccountId: { type: 'string', description: 'Sender account ID' },
                toAccountId: { type: 'string', description: 'Recipient account ID' },
                serialNumber: { type: 'number', description: 'Serial number of the NFT to transfer' }
            },
            required: ['tokenId', 'fromAccountId', 'toAccountId', 'serialNumber']
        },
        implementation: async (args, config) => {
            return transferNFT(
                config,
                args.tokenId as string,
                args.fromAccountId as string,
                args.toAccountId as string,
                args.serialNumber as number
            );
        }
    },
    {
        name: 'hedera_burn_nft',
        description: `Burns specific NFTs by serial number, permanently removing them from circulation.
Requires the supply key. NFTs must be in the treasury account.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'NFT collection token ID' },
                serialNumbers: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of serial numbers to burn'
                }
            },
            required: ['tokenId', 'serialNumbers']
        },
        implementation: async (args, config) => {
            return burnNFT(config, args.tokenId as string, args.serialNumbers as number[]);
        }
    },
    {
        name: 'hedera_get_nft_info',
        description: `Gets detailed info about a specific NFT by its serial number.
Uses mirror node — no network fee. Decodes base64 metadata automatically.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'NFT collection token ID' },
                serialNumber: { type: 'number', description: 'Serial number of the NFT' }
            },
            required: ['tokenId', 'serialNumber']
        },
        implementation: async (args, config) => {
            return getNFTInfo(config, args.tokenId as string, args.serialNumber as number);
        }
    },
    {
        name: 'hedera_get_account_nfts',
        description: `Lists all NFTs held by a Hiero account. Optionally filter by collection.
Uses mirror node — no network fee. Decodes metadata automatically.`,
        inputSchema: {
            type: 'object',
            properties: {
                accountId: { type: 'string', description: 'Hiero account ID to query' },
                tokenId: { type: 'string', description: 'Optional: filter to specific NFT collection' }
            },
            required: ['accountId']
        },
        implementation: async (args, config) => {
            return getAccountNFTs(config, args.accountId as string, args.tokenId as string | undefined);
        }
    },
    {
        name: 'contract_verify_holder',
        description: `Verifies whether a Hiero account holds a valid contract NFT of a specific type.
Generic across all PPP contract types (NDA, EPC, O&M, CONCESSION, PERFORMANCE_BOND, ESS, etc.).
Checks: account holds NFT from collection → metadata type matches → optional project filter → optional expiry check.
Returns hasAccess flag with full contract details on success.
Used as the verification step in N8N contract workflow templates.`,
        inputSchema: {
            type: 'object',
            properties: {
                tokenId: { type: 'string', description: 'NFT collection token ID for this contract type (e.g. 0.0.12345)' },
                accountId: { type: 'string', description: 'Hiero account ID to verify' },
                contractType: {
                    type: 'string',
                    description: 'Contract type string to match in NFT metadata (e.g. NDA, EPC, OM, CONCESSION, PERFORMANCE_BOND, ESS)'
                },
                projectId: { type: 'string', description: 'Optional: filter to a specific project ID' },
                checkExpiry: { type: 'boolean', description: 'Whether to enforce expiry date (default: true)', default: true }
            },
            required: ['tokenId', 'accountId', 'contractType']
        },
        implementation: async (args, config) => {
            return verifyContractHolder(config, {
                tokenId: args.tokenId as string,
                accountId: args.accountId as string,
                contractType: args.contractType as string,
                projectId: args.projectId as string | undefined,
                checkExpiry: args.checkExpiry as boolean | undefined
            });
        }
    }
];
