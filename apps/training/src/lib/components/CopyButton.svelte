<script lang="ts">
	let { text = '' }: { text: string } = $props();
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<button class="copy-btn" onclick={copy} title="Copy to clipboard">
	{#if copied}
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
		<span>Copied</span>
	{:else}
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
		<span>Copy</span>
	{/if}
</button>

<style>
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		color: var(--text-muted);
		padding: 4px 8px;
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	.copy-btn:hover {
		color: var(--accent);
		border-color: var(--border-light);
	}
</style>
