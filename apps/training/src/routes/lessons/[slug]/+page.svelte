<script lang="ts">
	import LessonStep from '$lib/components/LessonStep.svelte';
	import LessonSummary from '$lib/components/LessonSummary.svelte';
	import PrimitiveChip from '$lib/components/PrimitiveChip.svelte';
	import { getAdjacentLessons } from '$lib/data/lessons';

	let { data } = $props();
	const lesson = $derived(data.lesson);
	const adjacent = $derived(getAdjacentLessons(lesson.slug));
</script>

<svelte:head>
	<title>{lesson.title} — Tressellate Training</title>
</svelte:head>

<article class="lesson-page">
	<header class="lesson-header" style="--lesson-color: {lesson.color}">
		<div class="lesson-meta-row">
			<span class="lesson-domain" style="color: {lesson.color}">{lesson.domain}</span>
			<span class="lesson-tool-count">{lesson.toolCount} tools</span>
			<span class="lesson-step-count">{lesson.steps.length} steps</span>
		</div>
		<h1>{lesson.title}</h1>
		<p class="lesson-desc">{lesson.description}</p>
		<div class="lesson-chips">
			{#each lesson.primitives as prim}
				<PrimitiveChip name={prim} color={lesson.color} />
			{/each}
		</div>
	</header>

	<div class="steps-list">
		{#each lesson.steps as step, i}
			{#if step.group && (i === 0 || step.group !== lesson.steps[i - 1]?.group)}
				<div class="group-divider">
					<span class="group-label">{step.group}</span>
				</div>
			{/if}
			<LessonStep {step} index={i} lessonId={lesson.id} />
		{/each}
	</div>

	<LessonSummary items={lesson.summary} lessonId={lesson.id} />

	<nav class="lesson-nav">
		{#if adjacent.prev}
			<a href="/lessons/{adjacent.prev.slug}" class="nav-link prev">
				<span class="nav-dir">Previous</span>
				<span class="nav-title">{adjacent.prev.title}</span>
			</a>
		{:else}
			<div></div>
		{/if}
		{#if adjacent.next}
			<a href="/lessons/{adjacent.next.slug}" class="nav-link next">
				<span class="nav-dir">Next</span>
				<span class="nav-title">{adjacent.next.title}</span>
			</a>
		{/if}
	</nav>
</article>

<style>
	.lesson-page { max-width: 760px; }

	.lesson-header {
		padding: 2rem 0 1.5rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 2rem;
	}
	.lesson-meta-row {
		display: flex;
		gap: 14px;
		align-items: center;
		margin-bottom: 10px;
	}
	.lesson-domain {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.lesson-tool-count, .lesson-step-count {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
	}
	h1 {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 400;
		margin-bottom: 0.75rem;
	}
	.lesson-desc {
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.5;
		margin-bottom: 1rem;
		max-width: 600px;
	}
	.lesson-chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.steps-list {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-bottom: 2rem;
	}
	.group-divider {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 0 4px;
		margin-top: 8px;
	}
	.group-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}
	.group-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.lesson-nav {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}
	.nav-link {
		display: flex;
		flex-direction: column;
		padding: 12px 18px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 8px;
		text-decoration: none;
		transition: border-color 0.2s;
	}
	.nav-link:hover { border-color: var(--border-light); text-decoration: none; }
	.nav-link.next { text-align: right; }
	.nav-dir { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; }
	.nav-title { font-size: 0.9rem; color: var(--text-primary); font-weight: 500; }
</style>
