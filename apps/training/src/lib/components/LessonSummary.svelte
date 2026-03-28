<script lang="ts">
	import type { LessonSummaryItem } from '$lib/data/types';
	import { progress } from '$lib/stores/progress';

	let { items, lessonId }: { items: LessonSummaryItem[]; lessonId: string } = $props();
</script>

<div class="summary">
	<h3>Verification Summary</h3>
	<table>
		<thead>
			<tr>
				<th>Capability</th>
				<th>Tool Used</th>
				<th>Verified</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item, i}
				{@const key = `${lessonId}:${i}`}
				{@const checked = $progress.verifiedItems[key] ?? false}
				<tr>
					<td>{item.capability}</td>
					<td><code>{item.toolUsed}</code></td>
					<td>
						<button class="verify-btn" onclick={() => progress.toggleVerified(lessonId, i)}>
							{#if checked}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><rect x="3" y="3" width="18" height="18" rx="4"/><polyline points="9 12 11.5 14.5 15.5 9.5" fill="none" stroke="var(--bg-deep)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
							{/if}
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.summary {
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}
	h3 {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 400;
		padding: 14px 16px;
		background: var(--bg-elevated);
		border-bottom: 1px solid var(--border);
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		text-align: left;
		padding: 10px 16px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		border-bottom: 1px solid var(--border);
		background: var(--bg-surface);
	}
	td {
		padding: 10px 16px;
		font-size: 0.85rem;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border);
	}
	td code {
		font-size: 0.8rem;
	}
	tr:last-child td {
		border-bottom: none;
	}
	.verify-btn {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		padding: 0;
	}
</style>
