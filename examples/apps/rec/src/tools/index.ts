import { REC_COLLECTION_TOOLS } from './collection.js';
import { REC_QUERY_TOOLS } from './query.js';
import { REC_AUDIT_TOOLS } from './audit.js';

export const REC_TOOLS = [
	...REC_COLLECTION_TOOLS,
	...REC_QUERY_TOOLS,
	...REC_AUDIT_TOOLS
];

export { REC_COLLECTION_TOOLS, REC_QUERY_TOOLS, REC_AUDIT_TOOLS };
