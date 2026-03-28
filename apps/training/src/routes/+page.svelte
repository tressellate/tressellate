<script lang="ts">
	import { coreLessons, domainLessons } from '$lib/data/lessons';
	import PrimitiveChip from '$lib/components/PrimitiveChip.svelte';
	import { progress } from '$lib/stores/progress';

	const primitives = [
		{ name: 'Certificate', represents: 'A verified attestation', example: 'Crop yield cert, drug lot cert', hederaType: 'NFT' },
		{ name: 'Provenance', represents: 'Origin + custody chain', example: 'Parts tracking, supply chain', hederaType: 'NFT' },
		{ name: 'Credit', represents: 'A unit of value', example: 'Renewable energy credit', hederaType: 'Fungible Token' },
		{ name: 'Agreement', represents: 'A multi-party contract', example: 'Lease, service agreement', hederaType: 'NFT + Transfer' },
		{ name: 'Inspection', represents: 'An evaluation result', example: 'Soil test, safety audit', hederaType: 'NFT' },
		{ name: 'Milestone', represents: 'A progress marker', example: 'Payment received', hederaType: 'HCS Message' },
		{ name: 'Claim', represents: 'An assertion to verify', example: 'Insurance claim', hederaType: 'NFT' },
	];
</script>

<svelte:head>
	<title>Tressellate Training</title>
</svelte:head>

<div class="home">
	<header class="hero">
		<span class="badge">Verifier Training</span>
		<h1>Learn tressellate,<br/><em>no code required.</em></h1>
		<p class="subtitle">
			Interactive exercises that walk you through all 48 MCP tools across 5 regulated domains.
			Every step shows you what to say, what the AI calls, and what comes back.
		</p>
		<div class="hero-actions">
			<a href="/setup" class="btn-primary">Start Setup</a>
			<a href="/lessons/crop-cert" class="btn-secondary">Jump to First Lesson</a>
		</div>
	</header>

	<section class="primitives-section">
		<h2>The 7 Universal Primitives</h2>
		<p class="section-desc">Every asset in tressellate maps to one of these types. This is what makes the system learnable — the structural patterns are always the same.</p>
		<div class="primitives-grid">
			{#each primitives as p}
				<div class="prim-card">
					<h3>{p.name}</h3>
					<p class="prim-represents">{p.represents}</p>
					<p class="prim-example">{p.example}</p>
					<span class="prim-type">{p.hederaType}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="lessons-section">
		<h2>Core Foundation</h2>
		<p class="section-desc">Start here. Learn the raw Hedera primitives and Guardian governance patterns that every domain builds on.</p>
		<div class="lessons-grid">
			{#each coreLessons as lesson}
				{@const pct = progress.getCompletionPercent($progress, lesson.id, lesson.steps.length)}
				<a href="/lessons/{lesson.slug}" class="lesson-card" style="--card-color: {lesson.color}">
					<div class="lesson-card-header">
						<span class="lesson-domain">{lesson.title}</span>
						{#if pct > 0}
							<span class="lesson-pct">{pct}%</span>
						{/if}
					</div>
					<h3>{lesson.title}</h3>
					<p>{lesson.description.slice(0, 120)}...</p>
					<div class="lesson-meta">
						<span>{lesson.toolCount > 0 ? `${lesson.toolCount} tools` : 'patterns'}</span>
						<span>{lesson.steps.length} steps</span>
					</div>
					<div class="lesson-chips">
						{#each lesson.primitives as prim}
							<PrimitiveChip name={prim} color={lesson.color} />
						{/each}
					</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="lessons-section">
		<h2>Domain Lessons</h2>
		<p class="section-desc">Each lesson isolates one regulated domain. Complete them in order or jump to the one you need.</p>
		<div class="lessons-grid">
			{#each domainLessons as lesson}
				{@const pct = progress.getCompletionPercent($progress, lesson.id, lesson.steps.length)}
				<a href="/lessons/{lesson.slug}" class="lesson-card" style="--card-color: {lesson.color}">
					<div class="lesson-card-header">
						<span class="lesson-domain">{lesson.domain}</span>
						{#if pct > 0}
							<span class="lesson-pct">{pct}%</span>
						{/if}
					</div>
					<h3>{lesson.title}</h3>
					<p>{lesson.description.slice(0, 120)}...</p>
					<div class="lesson-meta">
						<span>{lesson.toolCount} tools</span>
						<span>{lesson.steps.length} steps</span>
					</div>
					<div class="lesson-chips">
						{#each lesson.primitives as prim}
							<PrimitiveChip name={prim} color={lesson.color} />
						{/each}
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	.home { max-width: 760px; }

	.hero { padding: 3rem 0 2rem; }
	.badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
		background: var(--accent-glow-strong);
		padding: 4px 12px;
		border-radius: 12px;
		border: 1px solid rgba(74, 222, 128, 0.2);
		margin-bottom: 1.5rem;
	}
	h1 {
		font-family: var(--font-display);
		font-size: 2.8rem;
		font-weight: 400;
		line-height: 1.15;
		margin-bottom: 1rem;
	}
	h1 em {
		color: var(--accent);
		font-style: italic;
	}
	.subtitle {
		font-size: 1.05rem;
		color: var(--text-secondary);
		line-height: 1.6;
		max-width: 560px;
		margin-bottom: 2rem;
	}
	.hero-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	.btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 10px 24px;
		background: var(--accent);
		color: var(--bg-deep);
		font-weight: 600;
		font-size: 0.9rem;
		border-radius: 8px;
		text-decoration: none;
		transition: opacity 0.2s;
	}
	.btn-primary:hover { opacity: 0.9; text-decoration: none; }
	.btn-secondary {
		display: inline-flex;
		align-items: center;
		padding: 10px 24px;
		background: transparent;
		color: var(--text-secondary);
		font-size: 0.9rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		text-decoration: none;
		transition: border-color 0.2s, color 0.2s;
	}
	.btn-secondary:hover { border-color: var(--border-light); color: var(--text-primary); text-decoration: none; }

	h2 {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
	.section-desc {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.primitives-section { padding: 2rem 0; }
	.primitives-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 10px;
	}
	.prim-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 14px;
		transition: border-color 0.2s;
	}
	.prim-card:hover { border-color: var(--border-light); }
	.prim-card h3 { font-family: var(--font-body); font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
	.prim-represents { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px; }
	.prim-example { font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-bottom: 8px; }
	.prim-type {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--accent);
		background: var(--accent-glow);
		padding: 2px 8px;
		border-radius: 8px;
	}

	.lessons-section { padding: 2rem 0 3rem; }
	.lessons-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.lesson-card {
		display: block;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-left: 3px solid var(--card-color);
		border-radius: 8px;
		padding: 16px 18px;
		text-decoration: none;
		transition: border-color 0.2s, background 0.2s;
	}
	.lesson-card:hover { background: var(--bg-hover); border-color: var(--border-light); text-decoration: none; }
	.lesson-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}
	.lesson-domain {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--card-color);
	}
	.lesson-pct {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--accent);
	}
	.lesson-card h3 { font-size: 1rem; font-weight: 500; margin-bottom: 6px; color: var(--text-primary); }
	.lesson-card p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; }
	.lesson-meta {
		display: flex;
		gap: 14px;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
		margin-bottom: 10px;
	}
	.lesson-chips { display: flex; gap: 6px; flex-wrap: wrap; }

	@media (max-width: 768px) {
		h1 { font-size: 2rem; }
		.primitives-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
	}
</style>
