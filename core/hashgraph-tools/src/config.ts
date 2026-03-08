import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

export interface HederaConfig {
    network: 'testnet' | 'previewnet' | 'mainnet';
    operatorAccountId: string;
    operatorPrivateKey: string;
    supplyKey: string;
    mirrorNodeUrl?: string;
}

export function buildClient(config: HederaConfig): Client {
    const client =
        config.network === 'mainnet'
            ? Client.forMainnet()
            : config.network === 'previewnet'
                ? Client.forPreviewnet()
                : Client.forTestnet();

    client.setOperator(
        AccountId.fromString(config.operatorAccountId),
        PrivateKey.fromString(config.operatorPrivateKey)
    );

    return client;
}

export const MIRROR_NODE_URLS: Record<string, string> = {
    testnet: 'https://testnet.mirrornode.hedera.com/api/v1',
    previewnet: 'https://previewnet.mirrornode.hedera.com/api/v1',
    mainnet: 'https://mainnet-public.mirrornode.hedera.com/api/v1'
};

export interface MCPTool<TConfig extends HederaConfig = HederaConfig> {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    implementation: (args: Record<string, unknown>, config: TConfig) => Promise<unknown>;
}
