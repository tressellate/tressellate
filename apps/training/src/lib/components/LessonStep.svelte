<script lang="ts">
	import type { LessonStep } from '$lib/data/types';
	import { progress } from '$lib/stores/progress';
	import PromptBlock from './PromptBlock.svelte';
	import ToolCallPanel from './ToolCallPanel.svelte';

	let { step, index, lessonId }: {
		step: LessonStep;
		index: number;
		lessonId: string;
	} = $props();

	let expanded = $state(true);
	const stepKey = `${lessonId}:${step.id}`;
	const completed = $derived($progress.completedSteps[stepKey] ?? false);

	function toggleExpanded() {
		expanded = !expanded;
	}

	function toggleCompleted(e: Event) {
		e.stopPropagation();
		progress.toggleStep(lessonId, step.id);
	}
</script>

<div class="lesson-step" class:completed class:setup={step.isSetup}>
	<div class="step-header" role="button" tabindex="0" onclick={toggleExpanded} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpanded(); }}>
		<div class="step-left">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<span class="step-checkbox" role="checkbox" aria-checked={completed} tabindex="0" onclick={toggleCompleted}>
				{#if completed}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><rect x="3" y="3" width="18" height="18" rx="4"/><polyline points="9 12 11.5 14.5 15.5 9.5" fill="none" stroke="var(--bg-deep)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
				{/if}
			</span>
			<span class="step-number">{index + 1}</span>
			<span class="step-title">{step.title}</span>
			{#if step.isSetup}
				<span class="setup-badge">Setup</span>
			{/if}
		</div>
		<svg class="chevron" class:open={expanded} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
	</div>

	{#if expanded}
		<div class="step-body">
			<p class="step-desc">{step.description}</p>

			{#if step.prompt}
				<PromptBlock prompt={step.prompt} />
			{/if}

			{#if step.toolCall}
				<ToolCallPanel tool={step.toolCall} />
			{/if}

			{#if step.verification}
				<div class="verification">
					<span class="verify-icon">?</span>
					<p><strong>Verification:</strong> {step.verification}</p>
				</div>
			{/if}

			{#if step.note}
				<div class="step-note">
					<p>{step.note}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.lesson-step {
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.2s;
	}
	.lesson-step:hover {
		border-color: var(--border-light);
	}
	.lesson-step.completed {
		border-color: var(--border);
		opacity: 0.85;
	}
	.lesson-step.setup {
		border-left: 3px solid var(--violet);
	}
	.step-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 14px 16px;
		background: var(--bg-elevated);
		border: none;
		cursor: pointer;
		color: var(--text-primary);
		font-family: var(--font-body);
		text-align: left;
	}
	.step-header:hover {
		background: var(--bg-hover);
	}
	.step-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.step-checkbox {
		cursor: pointer;
		display: flex;
		padding: 0;
	}
	.step-number {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
		background: var(--bg-surface);
		padding: 2px 8px;
		border-radius: 10px;
		border: 1px solid var(--border);
	}
	.step-title {
		font-weight: 500;
		font-size: 0.95rem;
	}
	.setup-badge {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--violet);
		background: rgba(167, 139, 250, 0.1);
		padding: 2px 8px;
		border-radius: 10px;
		border: 1px solid rgba(167, 139, 250, 0.2);
	}
	.chevron {
		color: var(--text-muted);
		transition: transform 0.2s;
		flex-shrink: 0;
	}
	.chevron.open {
		transform: rotate(180deg);
	}
	.step-body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		border-top: 1px solid var(--border);
		background: var(--bg-deep);
	}
	.step-desc {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}
	.verification {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		padding: 12px 14px;
		background: rgba(74, 222, 128, 0.04);
		border: 1px solid rgba(74, 222, 128, 0.12);
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}
	.verify-icon {
		color: var(--accent);
		font-weight: 700;
		font-family: var(--font-mono);
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1.5px solid var(--accent);
		border-radius: 50%;
		font-size: 0.7rem;
	}
	.step-note {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-style: italic;
		padding-left: 12px;
		border-left: 2px solid var(--border);
	}
</style>
