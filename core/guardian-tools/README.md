# @tressellate/guardian-tools

**Layer 2 — Governance Interface for the Hiero Ecosystem**

This package provides a pluggable `GovernanceProvider` interface that abstracts governance operations — identity, authorization, persona resolution, and verifiable credentials — behind a clean contract. Layer 5 domain tools depend on this interface, not on any specific governance implementation.

## What This Layer Does

Guardian tools define the governance contract that higher layers program against. The `GovernanceProvider` interface specifies how to check authorization, resolve personas, issue credentials, and manage policies. Implementations can range from a pass-through `NoopGovernanceProvider` (for development) to full [Guardian](https://github.com/hashgraph/guardian) integration.

## What This Layer Does NOT Do

This layer does not contain domain-specific logic. It provides governance primitives that Layer 3 asset types and Layer 5 domain tools compose into workflows.

This package currently exports **no MCP tools** — it is a TypeScript interface + provider library. MCP tool wrappers for Guardian will be added as the Guardian integration matures.

## GovernanceProvider Interface

The core abstraction. All governance implementations must satisfy this contract:

```typescript
interface GovernanceProvider {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;

  // Required — minimum governance gate
  isAuthorized(
    accountId: string,
    operation: string,
    context?: Record<string, unknown>
  ): Promise<boolean>;

  // Required — persona/role resolution
  resolvePersona(
    accountId: string,
    requiredRole: string,
    domain?: string
  ): Promise<PersonaResolution>;

  // Optional — requires capabilities.verifiableCredentials
  issueCredential?(
    subjectId: string,
    claims: Record<string, unknown>,
    policyId?: string
  ): Promise<VerifiableCredential>;

  // Optional — requires capabilities.verifiableCredentials
  verifyCredential?(
    credential: VerifiableCredential
  ): Promise<VerificationResult>;

  // Optional — requires capabilities.policyManagement
  listPolicies?(): Promise<Policy[]>;

  // Optional — requires capabilities.policyManagement
  getPolicy?(policyId: string): Promise<Policy | null>;
}
```

### ProviderCapabilities

Each provider declares what it supports:

```typescript
interface ProviderCapabilities {
  verifiableCredentials: boolean;  // Full VC lifecycle (issue, verify, revoke)
  policyManagement: boolean;       // Policy creation and management
  personaResolution: boolean;      // Cross-domain persona resolution
  crossDomainReferences: boolean;  // Cross-domain reference resolution
  dmrvWorkflows: boolean;          // dMRV workflow execution
}
```

## Included Providers

### NoopGovernanceProvider

A pass-through provider for development and testing that authorizes all operations:

```typescript
import { NoopGovernanceProvider } from '@tressellate/guardian-tools';

const provider = new NoopGovernanceProvider();

await provider.isAuthorized('0.0.123', 'mint_certificate'); // → true
await provider.resolvePersona('0.0.123', 'Inspector');
// → { authorized: true, reason: 'NoopGovernanceProvider: all personas authorized in development mode' }

provider.capabilities;
// → { verifiableCredentials: false, policyManagement: false, ... }
```

## Types

| Type | Description |
|------|-------------|
| `GovernanceProvider` | Core governance interface |
| `ProviderCapabilities` | Capability flags for a provider |
| `VerificationResult` | Result of credential verification |
| `PersonaResolution` | Result of persona/role resolution |
| `VerifiableCredential` | W3C VC with context, type, issuer, proof |
| `PersonaCredential` | Persona binding identity to role |
| `Policy` | Guardian policy (id, name, version, status) |
| `GuardianConfig` | Configuration extending HederaConfig |

### Policy Status

```typescript
type PolicyStatus = 'DRAFT' | 'DRY_RUN' | 'PUBLISHED' | 'DISCONTINUED';
```

## Usage Pattern

Domain tools program against the `GovernanceProvider` interface:

```typescript
import type { GovernanceProvider } from '@tressellate/guardian-tools';

async function mintCertificate(
  config: DomainConfig,
  args: CertificateArgs,
  governance: GovernanceProvider,
) {
  // Gate: check authorization before any ledger write
  const authorized = await governance.isAuthorized(
    args.issuerId,
    'mint_certificate',
    { domain: 'agriculture' },
  );
  if (!authorized) throw new Error('Not authorized');

  // Resolve persona for audit trail
  const persona = await governance.resolvePersona(
    args.issuerId,
    'CertifiedInspector',
    'agriculture',
  );

  // Proceed with mint (Layer 1 calls)...
}
```

## Implementing a Custom Provider

```typescript
import type { GovernanceProvider, ProviderCapabilities } from '@tressellate/guardian-tools';

class RBACProvider implements GovernanceProvider {
  readonly name = 'RBAC';
  readonly capabilities: ProviderCapabilities = {
    verifiableCredentials: false,
    policyManagement: false,
    personaResolution: true,
    crossDomainReferences: false,
    dmrvWorkflows: false,
  };

  async isAuthorized(accountId: string, operation: string): Promise<boolean> {
    // Your role-based access control logic
  }

  async resolvePersona(accountId: string, requiredRole: string): Promise<PersonaResolution> {
    // Your persona resolution logic
  }
}
```

## Roadmap

- [ ] `GuardianProvider` — Full Guardian Standard Registry integration
- [ ] Multi-policy orchestration
- [ ] MCP tool wrappers for Guardian API operations
- [ ] dMRV workflow execution

## License

Apache License 2.0
