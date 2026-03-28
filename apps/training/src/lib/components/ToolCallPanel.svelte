<script lang="ts">
	import type { ToolCallSimulation } from '$lib/data/types';
	import JsonViewer from './JsonViewer.svelte';

	let { tool }: { tool: ToolCallSimulation } = $props();
</script>

<div class="tool-panel">
	<div class="tool-header">
		<svg class="tool-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
		<code class="tool-name">{tool.toolName}</code>
	</div>
	<p class="tool-desc">{tool.description}</p>
	<div class="tool-io">
		<JsonViewer data={tool.exampleArgs} label="Input" borderColor="var(--blue)" />
		<JsonViewer data={tool.mockResponse} label="Output" borderColor="var(--accent)" />
	</div>
</div>

<style>
	.tool-panel {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}
	.tool-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px 0;
	}
	.tool-icon {
		color: var(--accent);
		flex-shrink: 0;
	}
	.tool-name {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: var(--accent);
		background: none;
		border: none;
		padding: 0;
	}
	.tool-desc {
		padding: 4px 16px 12px;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.tool-io {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: var(--border);
	}
</style>
