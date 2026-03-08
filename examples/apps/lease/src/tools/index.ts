import { LEASE_COLLECTION_TOOLS } from './collection.js';
import { LEASE_QUERY_TOOLS } from './query.js';
import { LEASE_AUDIT_TOOLS } from './audit.js';

export const LEASE_TOOLS = [
	...LEASE_COLLECTION_TOOLS,
	...LEASE_QUERY_TOOLS,
	...LEASE_AUDIT_TOOLS
];

export { LEASE_COLLECTION_TOOLS, LEASE_QUERY_TOOLS, LEASE_AUDIT_TOOLS };
