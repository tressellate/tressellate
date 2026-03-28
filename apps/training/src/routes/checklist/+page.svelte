<script lang="ts">
	import { lessons } from '$lib/data/lessons/index';
	import { progress } from '$lib/stores/progress';

	const crossCuttingChecks = [
		{ id: 'immutability', label: 'Immutability', description: 'Try modifying a minted certificate — it should be impossible' },
		{ id: 'traceability', label: 'Traceability', description: 'Every write operation appears in the audit trail' },
		{ id: 'transparency', label: 'Transparency', description: 'Any serial number can be verified by anyone with access' },
		{ id: 'uniqueness', label: 'Uniqueness', description: 'Each NFT serial number is globally unique' },
		{ id: 'timestamping', label: 'Timestamping', description: 'Audit entries have Hedera consensus timestamps' },
		{ id: 'separation', label: 'Separation of concerns', description: 'Domain tools compose core tools, not bypass them' },
	];
</script>

<svelte:head>
	<title>Verification Checklist — Tressellate Training</title>
</svelte:head>

<article class="checklist-page">
	<header>
		<span class="badge">Sign-off</span>
		<h1>Verification Checklist</h1>
		<p class="subtitle">Use this as a sign-off sheet after completing exercises.</p>
	</header>

	<section class="domain-table">
		<h2>Per-Domain Verification</h2>
		<table>
			<thead>
				<tr>
					<th>Domain</th>
					<th>Progress</th>
					<th>Steps</th>
				</tr>
			</thead>
			<tbody>
				{#each lessons as lesson}
					{@const pct = progress.getCompletionPercent($progress, lesson.id, lesson.steps.length)}
					{@const completed = Object.entries($progress.completedSteps).filter(([k, v]) => k.startsWith(`${lesson.id}:`) && v).length}
					<tr>
						<td>
							<a href="/lessons/{lesson.slug}" style="color: {lesson.color}">{lesson.domain}</a>
						</td>
						<td>
							<div class="progress-bar">
								<div class="progress-fill" style="width: {pct}%; background: {lesson.color}"></div>
							</div>
							<span class="pct-label">{pct}%</span>
						</td>
						<td class="steps-cell">{completed} / {lesson.steps.length}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="cross-cutting">
		<h2>Cross-Cutting Verification</h2>
		<div class="checks-list">
			{#each crossCuttingChecks as check}
				{@const checked = $progress.crossCuttingChecks[check.id] ?? false}
				<button class="check-item" class:checked onclick={() => progress.toggleCrossCutting(check.id)}>
					<div class="check-box">
						{#if checked}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><rect x="3" y="3" width="18" height="18" rx="4"/><polyline points="9 12 11.5 14.5 15.5 9.5" fill="none" stroke="var(--bg-deep)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
						{:else}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
						{/if}
					</div>
					<div class="check-text">
						<strong>{check.label}</strong>
						<span>{check.description}</span>
					</div>
				</button>
			{/each}
		</div>
	</section>

	<section class="explorer">
		<h2>Verify Independently</h2>
		<p>After any exercise, confirm on the public Hedera explorer:</p>
		<a href="https://hashscan.io/testnet" target="_blank" rel="noopener" class="explorer-link">
			<span>HashScan Testnet Explorer</span>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
		</a>
		<p class="hint">Search by Account ID, Token ID, Topic ID, or Transaction ID.</p>
	</section>

	<div class="reset-section">
		<button class="reset-btn" onclick={() => { if(confirm('Reset all progress? This cannot be undone.')) progress.reset(); }}>
			Reset All Progress
		</button>
	</div>
</article>

<style>
	.checklist-page { max-width: 700px; }
	header { padding: 2rem 0 1.5rem; }
	.badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--amber);
		background: rgba(251, 191, 36, 0.1);
		padding: 4px 12px;
		border-radius: 12px;
		border: 1px solid rgba(251, 191, 36, 0.2);
		margin-bottom: 1rem;
	}
	h1 { font-family: var(--font-display); font-size: 2rem; font-weight: 400; margin-bottom: 0.5rem; }
	.subtitle { color: var(--text-secondary); font-size: 0.9rem; }
	h2 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 400; margin-bottom: 1rem; }

	.domain-table { padding: 2rem 0; border-bottom: 1px solid var(--border); }
	table { width: 100%; border-collapse: collapse; }
	th {
		text-align: left; padding: 10px 14px;
		font-family: var(--font-mono); font-size: 0.7rem;
		text-transform: uppercase; letter-spacing: 0.05em;
		color: var(--text-muted); border-bottom: 1px solid var(--border);
	}
	td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
	.progress-bar {
		width: 80px; height: 4px; background: var(--border); border-radius: 2px;
		display: inline-block; vertical-align: middle; margin-right: 8px;
	}
	.progress-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
	.pct-label { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }
	.steps-cell { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); }

	.cross-cutting { padding: 2rem 0; border-bottom: 1px solid var(--border); }
	.checks-list { display: flex; flex-direction: column; gap: 6px; }
	.check-item {
		display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px;
		background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 8px;
		cursor: pointer; text-align: left; width: 100%; transition: border-color 0.2s;
		font-family: var(--font-body); color: var(--text-primary);
	}
	.check-item:hover { border-color: var(--border-light); }
	.check-item.checked { opacity: 0.7; }
	.check-box { flex-shrink: 0; padding-top: 1px; }
	.check-text { display: flex; flex-direction: column; gap: 2px; }
	.check-text strong { font-size: 0.85rem; }
	.check-text span { font-size: 0.8rem; color: var(--text-muted); }

	.explorer { padding: 2rem 0; }
	.explorer p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
	.explorer-link {
		display: inline-flex; align-items: center; gap: 8px;
		padding: 10px 18px; background: var(--bg-elevated);
		border: 1px solid var(--border); border-radius: 8px;
		font-size: 0.9rem; color: var(--accent); text-decoration: none;
		transition: border-color 0.2s;
	}
	.explorer-link:hover { border-color: var(--accent); text-decoration: none; }
	.hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; }

	.reset-section { padding: 2rem 0; }
	.reset-btn {
		padding: 8px 18px; background: transparent;
		border: 1px solid var(--rose); border-radius: 6px;
		color: var(--rose); font-size: 0.8rem; cursor: pointer;
		transition: background 0.2s;
	}
	.reset-btn:hover { background: rgba(251, 113, 133, 0.08); }
</style>
