<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	let { data, label = '', borderColor = 'var(--accent)' }: {
		data: Record<string, unknown>;
		label?: string;
		borderColor?: string;
	} = $props();

	const raw = $derived(JSON.stringify(data, null, 2));

	function highlight(json: string): string {
		return json
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"([^"]+)"(?=\s*:)/g, '<span class="json-key">"$1"</span>')
			.replace(/:\s*"([^"]*?)"/g, ': <span class="json-string">"$1"</span>')
			.replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
			.replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>')
			.replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
	}
</script>

<div class="json-viewer" style="--border-accent: {borderColor}">
	{#if label}
		<div class="json-label">
			<span>{label}</span>
			<CopyButton text={raw} />
		</div>
	{/if}
	<pre class="json-body">{@html highlight(raw)}</pre>
</div>

<style>
	.json-viewer {
		border: 1px solid var(--border);
		border-left: 3px solid var(--border-accent);
		border-radius: 6px;
		overflow: hidden;
		background: var(--bg-surface);
	}
	.json-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		border-bottom: 1px solid var(--border);
		background: var(--bg-elevated);
	}
	.json-body {
		padding: 12px 16px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		line-height: 1.5;
		overflow-x: auto;
		color: var(--text-secondary);
	}
	:global(.json-key) { color: var(--blue); }
	:global(.json-string) { color: var(--accent-dim); }
	:global(.json-number) { color: var(--amber); }
	:global(.json-bool) { color: var(--violet); }
	:global(.json-null) { color: var(--text-muted); }
</style>
