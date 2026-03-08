import { HEDERA_TOKEN_TOOLS } from './token.js';
import { HEDERA_NFT_TOOLS } from './nft.js';
import { HEDERA_ACCOUNT_TOOLS } from './account.js';
import { HEDERA_CONSENSUS_TOOLS } from './consensus.js';
import { HEDERA_QUERY_TOOLS } from './query.js';

export const HEDERA_TOOLS = [
    ...HEDERA_TOKEN_TOOLS,
    ...HEDERA_NFT_TOOLS,
    ...HEDERA_ACCOUNT_TOOLS,
    ...HEDERA_CONSENSUS_TOOLS,
    ...HEDERA_QUERY_TOOLS
];

export { HEDERA_TOKEN_TOOLS, HEDERA_NFT_TOOLS, HEDERA_ACCOUNT_TOOLS, HEDERA_CONSENSUS_TOOLS, HEDERA_QUERY_TOOLS };
