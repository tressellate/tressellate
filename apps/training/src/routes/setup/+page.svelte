<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte';

	const configJson = `{
  "mcpServers": {
    "crop-cert": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/tressellate/examples/servers/crop-cert",
      "env": {
        "HEDERA_NETWORK": "testnet",
        "HEDERA_OPERATOR_ID": "0.0.YOUR_ID",
        "HEDERA_OPERATOR_KEY": "YOUR_PRIVATE_KEY",
        "HEDERA_SUPPLY_KEY": "YOUR_SUPPLY_KEY"
      }
    }
  }
}`;
</script>

<svelte:head>
	<title>Setup — Tressellate Training</title>
</svelte:head>

<article class="setup-page">
	<header>
		<span class="badge">Prerequisites</span>
		<h1>Setup</h1>
		<p class="subtitle">Get your environment ready in 15 minutes. No coding required — but you'll need someone with terminal access for steps 2-3.</p>
	</header>

	<section class="setup-step">
		<div class="step-num">1</div>
		<div class="step-content">
			<h2>Get a Hedera Testnet Account</h2>
			<p>Free account, no credit card needed. Takes 5 minutes.</p>
			<ol>
				<li>Go to <a href="https://portal.hedera.com" target="_blank" rel="noopener">portal.hedera.com</a> and create a free account</li>
				<li>Navigate to the <strong>Testnet</strong> section</li>
				<li>Copy your <strong>Account ID</strong> (looks like <code>0.0.12345</code>)</li>
				<li>Copy your <strong>DER-encoded private key</strong> (starts with <code>302e...</code>)</li>
			</ol>
			<div class="callout">These are free testnet credentials — no real money involved.</div>
		</div>
	</section>

	<section class="setup-step">
		<div class="step-num">2</div>
		<div class="step-content">
			<h2>Build Tressellate</h2>
			<p>Have a developer run these one-time commands:</p>
			<div class="code-block">
				<div class="code-header">
					<span>terminal</span>
					<CopyButton text="cd /path/to/tressellate && bun install && bun run build" />
				</div>
				<pre class="code-body"><span class="c-comment"># clone and build</span>
<span class="c-cmd">cd</span> /path/to/tressellate
<span class="c-cmd">bun</span> install
<span class="c-cmd">bun</span> run build</pre>
			</div>
		</div>
	</section>

	<section class="setup-step">
		<div class="step-num">3</div>
		<div class="step-content">
			<h2>Configure Claude Desktop</h2>
			<p>Add a domain server to your Claude Desktop config file.</p>
			<p class="hint">Location: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (Mac)</p>
			<div class="code-block">
				<div class="code-header">
					<span>claude_desktop_config.json</span>
					<CopyButton text={configJson} />
				</div>
				<pre class="code-body">{configJson}</pre>
			</div>
			<p>Restart Claude Desktop after saving.</p>
		</div>
	</section>

	<section class="setup-step">
		<div class="step-num">4</div>
		<div class="step-content">
			<h2>Verify Connection</h2>
			<p>Open Claude Desktop and ask:</p>
			<div class="verify-prompt">"What tools do you have available?"</div>
			<p>You should see both <code>hedera_*</code> tools and domain tools like <code>crop_cert_*</code>.</p>
			<div class="callout success">If you see the tools listed, you're ready. <a href="/lessons/crop-cert">Start Lesson 1</a>.</div>
		</div>
	</section>
</article>

<style>
	.setup-page { max-width: 700px; }

	header { padding: 2rem 0 1.5rem; }
	.badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--violet);
		background: rgba(167, 139, 250, 0.1);
		padding: 4px 12px;
		border-radius: 12px;
		border: 1px solid rgba(167, 139, 250, 0.2);
		margin-bottom: 1rem;
	}
	h1 { font-family: var(--font-display); font-size: 2.2rem; font-weight: 400; margin-bottom: 0.75rem; }
	.subtitle { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; }

	.setup-step {
		display: flex;
		gap: 20px;
		padding: 2rem 0;
		border-bottom: 1px solid var(--border);
	}
	.step-num {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 10px;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--accent);
		flex-shrink: 0;
	}
	.step-content { flex: 1; }
	.step-content h2 { font-family: var(--font-body); font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem; }
	.step-content p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem; }
	.step-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
	.step-content li { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem; }
	.hint { font-size: 0.8rem; color: var(--text-muted); }

	.code-block {
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		margin: 1rem 0;
	}
	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 14px;
		background: var(--bg-elevated);
		border-bottom: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
	}
	.code-body {
		padding: 14px 16px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.6;
		color: var(--text-secondary);
		overflow-x: auto;
	}
	:global(.c-comment) { color: var(--text-muted); }
	:global(.c-cmd) { color: var(--accent); }

	.callout {
		padding: 12px 16px;
		background: rgba(96, 165, 250, 0.06);
		border: 1px solid rgba(96, 165, 250, 0.15);
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}
	.callout.success {
		background: rgba(74, 222, 128, 0.06);
		border-color: rgba(74, 222, 128, 0.15);
	}

	.verify-prompt {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 1rem;
		color: var(--amber);
		padding: 12px 16px;
		background: var(--bg-elevated);
		border-left: 3px solid var(--amber);
		border-radius: 0 6px 6px 0;
		margin: 1rem 0;
	}

	@media (max-width: 768px) {
		.setup-step { flex-direction: column; gap: 10px; }
	}
</style>
