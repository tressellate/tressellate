import type { Lesson } from '../types';

export const hederaPrimitives: Lesson = {
	id: 'hedera-primitives',
	slug: 'hedera-primitives',
	title: 'Hedera Primitives',
	domain: 'Core',
	category: 'core',
	primitives: ['Account', 'Token', 'NFT', 'Consensus', 'Query'],
	toolCount: 22,
	color: 'var(--violet)',
	icon: 'cpu',
	description: 'The 22 Layer 1 tools that every domain server inherits. These are the raw building blocks — accounts, fungible tokens, NFTs, consensus messaging, and queries. Master these first.',
	steps: [
		// ── Accounts ──
		{
			id: 'create-account',
			title: 'Create an Account',
			group: 'Accounts',
			description: 'Create a new Hedera testnet account with an ED25519 key pair. Accounts hold tokens, NFTs, and HBAR.',
			prompt: 'Create a new Hedera testnet account',
			toolCall: {
				toolName: 'hedera_create_account',
				description: 'Creates a new Hiero account with an ED25519 key pair.',
				exampleArgs: {},
				mockResponse: { success: true, accountId: '0.0.8888', publicKey: '302a300506032b6570...', privateKey: '302e020100300506032b6570...' }
			},
			note: 'Save the Account ID for use in subsequent steps.'
		},
		{
			id: 'get-account-info',
			title: 'Get Account Info',
			group: 'Accounts',
			description: 'Query the mirror node for details about the account you just created.',
			prompt: 'Get account info for 0.0.8888',
			toolCall: {
				toolName: 'hedera_get_account_info',
				description: 'Gets account information via the Hedera mirror node.',
				exampleArgs: { accountId: '0.0.8888' },
				mockResponse: { success: true, accountId: '0.0.8888', balance: 100, autoRenewPeriod: 7776000 }
			}
		},
		// ── Fungible Tokens ──
		{
			id: 'create-token',
			title: 'Create a Fungible Token',
			group: 'Fungible Tokens',
			description: 'Fungible tokens represent interchangeable units — like currency, credits, or points. Every token of the same type is identical.',
			prompt: 'Create a new fungible token called "Training Token" with symbol "TRNG" and 2 decimal places',
			toolCall: {
				toolName: 'hedera_create_token',
				description: 'Creates a fungible token on Hedera Token Service.',
				exampleArgs: { tokenName: 'Training Token', tokenSymbol: 'TRNG', decimals: 2 },
				mockResponse: { success: true, tokenId: '0.0.9999', transactionId: '0.0.1234@1698770000.000' }
			}
		},
		{
			id: 'mint-token',
			title: 'Mint Fungible Tokens',
			group: 'Fungible Tokens',
			description: 'Mint additional supply of the token you created. Only the supply key holder can mint.',
			prompt: 'Mint 1000 units of token 0.0.9999',
			toolCall: {
				toolName: 'hedera_mint_token',
				description: 'Mints additional supply of a fungible token.',
				exampleArgs: { tokenId: '0.0.9999', amount: 1000 },
				mockResponse: { success: true, newTotalSupply: 1000, transactionId: '0.0.1234@1698770100.000' }
			}
		},
		{
			id: 'get-balance',
			title: 'Check Token Balance',
			group: 'Fungible Tokens',
			description: 'Query your token balance to confirm the mint succeeded.',
			prompt: 'Get balance of token 0.0.9999 for my account',
			toolCall: {
				toolName: 'hedera_get_token_balance',
				description: 'Gets the token balance for a specific account.',
				exampleArgs: { tokenId: '0.0.9999', accountId: '0.0.1234' },
				mockResponse: { success: true, balance: 1000, tokenId: '0.0.9999' }
			},
			verification: 'Balance should be 1000.'
		},
		{
			id: 'get-token-info',
			title: 'Get Token Info',
			group: 'Fungible Tokens',
			description: 'Query token statistics including name, symbol, and total supply.',
			prompt: 'Get info about token 0.0.9999',
			toolCall: {
				toolName: 'hedera_get_token_info',
				description: 'Gets token statistics (name, symbol, supply) from the mirror node.',
				exampleArgs: { tokenId: '0.0.9999' },
				mockResponse: { success: true, tokenId: '0.0.9999', name: 'Training Token', symbol: 'TRNG', totalSupply: 1000, decimals: 2 }
			}
		},
		// ── NFTs ──
		{
			id: 'create-nft',
			title: 'Create an NFT Collection',
			group: 'Non-Fungible Tokens (NFTs)',
			description: 'NFTs are unique — each has its own serial number and metadata. Collections group related NFTs under a single token ID.',
			prompt: 'Create an NFT collection called "Test NFTs" with symbol "TNFT"',
			toolCall: {
				toolName: 'hedera_create_nft_collection',
				description: 'Creates an NFT collection on Hedera Token Service.',
				exampleArgs: { tokenName: 'Test NFTs', tokenSymbol: 'TNFT' },
				mockResponse: { success: true, tokenId: '0.0.10001', transactionId: '0.0.1234@1698770200.000' }
			}
		},
		{
			id: 'mint-nft',
			title: 'Mint an NFT',
			group: 'Non-Fungible Tokens (NFTs)',
			description: 'Mint an NFT with custom metadata. This is how certificates, provenance records, and agreements are created.',
			prompt: 'Mint an NFT in collection 0.0.10001 with metadata: {"test": "hello world", "timestamp": "2025-10-15"}',
			toolCall: {
				toolName: 'hedera_mint_nft',
				description: 'Mints one or more NFTs with metadata.',
				exampleArgs: { tokenId: '0.0.10001', metadata: ['{"test":"hello world","timestamp":"2025-10-15"}'] },
				mockResponse: { success: true, serialNumbers: [1], transactionId: '0.0.1234@1698770300.000' }
			}
		},
		{
			id: 'get-nft-info',
			title: 'Get NFT Info',
			group: 'Non-Fungible Tokens (NFTs)',
			description: 'Query the metadata of the NFT you just minted. This proves data is on-chain.',
			prompt: 'Get info about NFT serial 1 in collection 0.0.10001',
			toolCall: {
				toolName: 'hedera_get_nft_info',
				description: 'Gets detailed NFT information including metadata.',
				exampleArgs: { tokenId: '0.0.10001', serialNumber: 1 },
				mockResponse: { success: true, tokenId: '0.0.10001', serialNumber: 1, owner: '0.0.1234', metadata: { test: 'hello world', timestamp: '2025-10-15' } }
			},
			verification: 'Does the metadata match what you minted?'
		},
		{
			id: 'list-nfts',
			title: 'List Account NFTs',
			group: 'Non-Fungible Tokens (NFTs)',
			description: 'List all NFTs held by an account — useful for verifying ownership.',
			prompt: 'List all NFTs held by my account',
			toolCall: {
				toolName: 'hedera_get_account_nfts',
				description: 'Lists all NFTs held by the specified account.',
				exampleArgs: { accountId: '0.0.1234' },
				mockResponse: { success: true, nfts: [{ tokenId: '0.0.10001', serialNumber: 1, metadata: { test: 'hello world' } }], total: 1 }
			}
		},
		// ── Consensus Service (Audit Trails) ──
		{
			id: 'create-topic',
			title: 'Create a Consensus Topic',
			group: 'Consensus Service (Audit Trails)',
			description: 'HCS topics are append-only message logs with Hedera consensus timestamps. This is the foundation of every audit trail in tressellate.',
			prompt: 'Create a new HCS topic',
			toolCall: {
				toolName: 'hedera_create_topic',
				description: 'Creates a Hedera Consensus Service topic.',
				exampleArgs: {},
				mockResponse: { success: true, topicId: '0.0.10010', transactionId: '0.0.1234@1698770400.000' }
			}
		},
		{
			id: 'submit-message',
			title: 'Submit a Topic Message',
			group: 'Consensus Service (Audit Trails)',
			description: 'Write a message to the HCS topic. Once submitted, it cannot be edited or deleted — true immutability.',
			prompt: 'Submit a message to topic 0.0.10010: "This is a test audit entry at 2025-10-15T10:00:00Z"',
			toolCall: {
				toolName: 'hedera_submit_topic_message',
				description: 'Submits a message to an HCS topic.',
				exampleArgs: { topicId: '0.0.10010', message: 'This is a test audit entry at 2025-10-15T10:00:00Z' },
				mockResponse: { success: true, sequenceNumber: 1, transactionId: '0.0.1234@1698770500.000' }
			}
		},
		{
			id: 'get-messages',
			title: 'Read Topic Messages',
			group: 'Consensus Service (Audit Trails)',
			description: 'Retrieve all messages from the topic to verify your submission.',
			prompt: 'Get all messages from topic 0.0.10010',
			toolCall: {
				toolName: 'hedera_get_topic_messages',
				description: 'Retrieves messages from an HCS topic via the mirror node.',
				exampleArgs: { topicId: '0.0.10010' },
				mockResponse: { success: true, messages: [{ sequenceNumber: 1, message: 'This is a test audit entry at 2025-10-15T10:00:00Z', consensusTimestamp: '2025-10-15T10:00:05.123Z' }], total: 1 }
			},
			verification: 'Does the message match what you submitted? Note the consensus timestamp — this is assigned by the Hedera network, not the client.'
		}
	],
	summary: [
		{ capability: 'Create account', toolUsed: 'hedera_create_account' },
		{ capability: 'Query account info', toolUsed: 'hedera_get_account_info' },
		{ capability: 'Create fungible token', toolUsed: 'hedera_create_token' },
		{ capability: 'Mint tokens', toolUsed: 'hedera_mint_token' },
		{ capability: 'Check balance', toolUsed: 'hedera_get_token_balance' },
		{ capability: 'Get token info', toolUsed: 'hedera_get_token_info' },
		{ capability: 'Create NFT collection', toolUsed: 'hedera_create_nft_collection' },
		{ capability: 'Mint NFT', toolUsed: 'hedera_mint_nft' },
		{ capability: 'Get NFT info', toolUsed: 'hedera_get_nft_info' },
		{ capability: 'List account NFTs', toolUsed: 'hedera_get_account_nfts' },
		{ capability: 'Create HCS topic', toolUsed: 'hedera_create_topic' },
		{ capability: 'Submit topic message', toolUsed: 'hedera_submit_topic_message' },
		{ capability: 'Read topic messages', toolUsed: 'hedera_get_topic_messages' }
	]
};

export const guardian: Lesson = {
	id: 'guardian',
	slug: 'guardian',
	title: 'Guardian & Governance',
	domain: 'Core',
	category: 'core',
	primitives: ['HITL', 'Verification', 'Governance'],
	toolCount: 0,
	color: 'var(--cyan)',
	icon: 'shield',
	description: 'Layer 2 provides governance, identity, and trust. While no MCP tools are exposed yet, it introduces three key patterns that domain tools rely on: Human-in-the-Loop decisions, multi-step verification pipelines, and the GovernanceProvider interface.',
	steps: [
		// ── Human-in-the-Loop (HITL) ──
		{
			id: 'hitl-concept',
			title: 'What is HITL?',
			group: 'Human-in-the-Loop (HITL)',
			description: 'HITL (Human-in-the-Loop) ensures that critical decisions — approvals, rejections, escalations — are recorded immutably. An AI agent proposes an action, a human approves or rejects it, and the decision is hashed and written to the ledger. This prevents "shadow decisions" where an agent acts without accountability.',
			note: 'HITL decisions use createDecisionRecorder() to write structured DecisionRecord entries to HCS topics. Each record includes: the proposal, the human\'s decision (APPROVE/REJECT/ESCALATE), a spec hash for tamper detection, and an optional RLHF signal for model improvement.'
		},
		{
			id: 'hitl-flow',
			title: 'HITL Decision Flow',
			group: 'Human-in-the-Loop (HITL)',
			description: 'The flow is: (1) Agent creates a DecisionProposal with context. (2) Human reviews and provides a DecisionResult (approve/reject/escalate + reasoning). (3) The system records a DecisionRecord to the audit trail with a cryptographic spec hash. (4) Optionally, an RLHF signal is emitted for model tuning.',
			toolCall: {
				toolName: 'createDecisionRecorder',
				description: 'Factory that creates a decision recorder bound to an HCS topic. Not an MCP tool — a composable function used inside domain tools.',
				exampleArgs: {
					proposal: { id: 'dec-001', action: 'APPROVE_LEASE', context: 'Tenant 0.0.9001 requesting Unit 4B', requiredRole: 'PROPERTY_MANAGER' },
					decision: { outcome: 'APPROVE', reasoning: 'Credit check passed, references verified', decidedBy: 'manager@example.com' }
				},
				mockResponse: {
					recorded: true,
					specHash: 'sha256:a1b2c3d4e5f6...',
					sequenceNumber: 42,
					outcome: 'APPROVE'
				}
			},
			verification: 'In a real deployment, could you tamper with this decision after it\'s recorded? No — the spec hash and HCS immutability prevent it.'
		},
		// ── Verification Pipelines ──
		{
			id: 'verification-concept',
			title: 'What are Verification Pipelines?',
			group: 'Verification Pipelines',
			description: 'A verification pipeline is a sequence of checks that an asset must pass before it\'s considered valid. Each step has a verifier type (AUTOMATED, HUMAN, ORACLE, CONSENSUS) and a trust tier (SELF_ATTESTED through REGULATORY). Steps execute in order and the pipeline stops on the first failure.',
			note: 'Verifier types: AUTOMATED (code checks), HUMAN (manual review), ORACLE (external data source), CONSENSUS (multi-party agreement). Trust tiers: SELF_ATTESTED < PEER_REVIEWED < THIRD_PARTY < REGULATORY.'
		},
		{
			id: 'verification-example',
			title: 'Example: Drug Lot Verification',
			group: 'Verification Pipelines',
			description: 'A drug lot certification might use a 3-step pipeline: (1) AUTOMATED — check NDC code format and expiration date validity. (2) ORACLE — query FDA database for drug registration. (3) HUMAN — GMP inspector reviews manufacturing records. All three must pass before the certificate NFT is minted.',
			toolCall: {
				toolName: 'createVerificationPipeline',
				description: 'Factory that creates a multi-step verification pipeline. Not an MCP tool — composed into domain tools.',
				exampleArgs: {
					name: 'drug-lot-verification',
					steps: [
						{ name: 'NDC Format Check', verifier: 'AUTOMATED', trustTier: 'SELF_ATTESTED' },
						{ name: 'FDA Registration', verifier: 'ORACLE', trustTier: 'REGULATORY' },
						{ name: 'GMP Inspection', verifier: 'HUMAN', trustTier: 'THIRD_PARTY' }
					]
				},
				mockResponse: {
					pipelineId: 'pipe-001',
					status: 'PASSED',
					steps: [
						{ name: 'NDC Format Check', status: 'PASSED', duration: '12ms' },
						{ name: 'FDA Registration', status: 'PASSED', duration: '340ms' },
						{ name: 'GMP Inspection', status: 'PASSED', duration: 'manual', decidedBy: 'inspector-QA207' }
					]
				}
			}
		},
		// ── GovernanceProvider ──
		{
			id: 'governance-provider',
			title: 'GovernanceProvider Interface',
			group: 'Governance Provider',
			description: 'The GovernanceProvider is a pluggable interface that domain tools call for identity, policy, and credential operations. The default NoopGovernanceProvider passes everything through (for development). In production, this connects to Hedera Guardian for verifiable credentials, policy enforcement, and role-based access.',
			note: 'The interface exposes: resolvePersona() — maps an identity to a role. verifyCredential() — checks a verifiable credential. checkPolicy() — evaluates a governance policy. getCapabilities() — reports what the provider supports. Domain tools call these without knowing whether they\'re talking to Guardian or a noop.'
		},
		{
			id: 'governance-noop-vs-guardian',
			title: 'Noop vs. Guardian Provider',
			group: 'Governance Provider',
			description: 'In training and development, NoopGovernanceProvider auto-approves everything — so you can focus on learning the tool workflows without setting up Guardian. In production, the real GuardianGovernanceProvider connects to the Guardian API for standards-based policy workflows, VC issuance, and trust chain verification.',
			toolCall: {
				toolName: 'NoopGovernanceProvider',
				description: 'Development provider that passes all checks. Not an MCP tool — injected into domain tool config.',
				exampleArgs: {
					operation: 'verifyCredential',
					credential: { type: 'GMP_CERTIFICATION', holder: 'manufacturer-001', standard: 'ISO 22000' }
				},
				mockResponse: {
					verified: true,
					provider: 'noop',
					note: 'Auto-approved — replace with GuardianGovernanceProvider for production'
				}
			}
		}
	],
	summary: [
		{ capability: 'Record HITL decisions immutably', toolUsed: 'createDecisionRecorder' },
		{ capability: 'Verify spec hash integrity', toolUsed: 'computeSpecHash / verifySpecHash' },
		{ capability: 'Run multi-step verification', toolUsed: 'createVerificationPipeline' },
		{ capability: 'Pluggable governance provider', toolUsed: 'GovernanceProvider interface' },
		{ capability: 'Development passthrough', toolUsed: 'NoopGovernanceProvider' }
	]
};
