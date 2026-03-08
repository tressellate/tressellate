import { describe, test, expect } from 'bun:test';
import { mockSDKModule } from './helpers/sdk-mock.js';

// Install SDK mock before importing
mockSDKModule();

const { HEDERA_TOKEN_TOOLS } = await import('../tools/token.js');
const { HEDERA_NFT_TOOLS } = await import('../tools/nft.js');
const { HEDERA_ACCOUNT_TOOLS } = await import('../tools/account.js');
const { HEDERA_CONSENSUS_TOOLS } = await import('../tools/consensus.js');
const { HEDERA_QUERY_TOOLS } = await import('../tools/query.js');

const allToolArrays = [
    { name: 'HEDERA_TOKEN_TOOLS', tools: HEDERA_TOKEN_TOOLS },
    { name: 'HEDERA_NFT_TOOLS', tools: HEDERA_NFT_TOOLS },
    { name: 'HEDERA_ACCOUNT_TOOLS', tools: HEDERA_ACCOUNT_TOOLS },
    { name: 'HEDERA_CONSENSUS_TOOLS', tools: HEDERA_CONSENSUS_TOOLS },
    { name: 'HEDERA_QUERY_TOOLS', tools: HEDERA_QUERY_TOOLS },
];

describe('MCPTool array structure', () => {
    for (const { name, tools } of allToolArrays) {
        describe(name, () => {
            test('is an array', () => {
                expect(Array.isArray(tools)).toBe(true);
            });

            test('has at least one tool', () => {
                expect(tools.length).toBeGreaterThan(0);
            });

            for (const tool of tools) {
                describe(`tool: ${tool.name}`, () => {
                    test('has name (string)', () => {
                        expect(typeof tool.name).toBe('string');
                        expect(tool.name.length).toBeGreaterThan(0);
                    });

                    test('has description (string)', () => {
                        expect(typeof tool.description).toBe('string');
                        expect(tool.description.length).toBeGreaterThan(0);
                    });

                    test('has inputSchema (object)', () => {
                        expect(typeof tool.inputSchema).toBe('object');
                        expect(tool.inputSchema).not.toBeNull();
                    });

                    test('has implementation (function)', () => {
                        expect(typeof tool.implementation).toBe('function');
                    });
                });
            }
        });
    }
});

describe('Tool name uniqueness', () => {
    test('no duplicate tool names across all arrays', () => {
        const allNames = allToolArrays.flatMap(({ tools }) => tools.map((t) => t.name));
        const uniqueNames = new Set(allNames);
        expect(uniqueNames.size).toBe(allNames.length);
    });
});

describe('Total tool count', () => {
    test('has expected number of tools', () => {
        const totalTools = allToolArrays.reduce((sum, { tools }) => sum + tools.length, 0);
        // 5 token + 7 nft + 2 account + 3 consensus + 5 query = 22
        expect(totalTools).toBe(22);
    });
});
