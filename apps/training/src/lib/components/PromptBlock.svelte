<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	let { prompt = '' }: { prompt: string } = $props();
</script>

<div class="prompt-block">
	<div class="prompt-header">
		<span class="prompt-label">Say to Claude</span>
		<CopyButton text={prompt} />
	</div>
	<div class="prompt-body">
		<span class="prompt-arrow">&rsaquo;</span>
		<p>{prompt}</p>
	</div>
</div>

<style>
	.prompt-block {
		border: 1px solid var(--border);
		border-left: 3px solid var(--amber);
		border-radius: 6px;
		overflow: hidden;
		background: var(--bg-surface);
	}
	.prompt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--amber);
		border-bottom: 1px solid var(--border);
		background: var(--bg-elevated);
	}
	.prompt-label {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.prompt-body {
		padding: 14px 16px;
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}
	.prompt-arrow {
		color: var(--amber);
		font-size: 1.2rem;
		line-height: 1.4;
		flex-shrink: 0;
	}
	.prompt-body p {
		font-family: var(--font-body);
		font-style: italic;
		color: var(--text-primary);
		line-height: 1.5;
		font-size: 0.95rem;
	}
</style>
