<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { coreLessons, domainLessons } from '$lib/data/lessons';
	import { progress } from '$lib/stores/progress';

	let { children } = $props();
	let sidebarOpen = $state(false);
</script>

<nav class="topnav">
	<div class="topnav-inner">
		<a href="/" class="brand">
			<svg width="24" height="24" viewBox="0 0 32 32" fill="none">
				<polygon points="16,2 22,5.5 22,12.5 16,16 10,12.5 10,5.5" stroke="url(#nav-g)" stroke-width="1.5" fill="none"/>
				<polygon points="16,12 22,15.5 22,22.5 16,26 10,22.5 10,15.5" stroke="url(#nav-g)" stroke-width="1.5" fill="none" opacity="0.6"/>
				<circle cx="16" cy="11" r="1.5" fill="url(#nav-g)"/>
				<defs><linearGradient id="nav-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs>
			</svg>
			<span>tressellate</span>
			<span class="training-badge">Training</span>
		</a>
		<div class="topnav-links">
			<a href="/setup">Setup</a>
			<a href="/checklist">Checklist</a>
			<a href="https://tressellate.dev" target="_blank" rel="noopener">Main Site</a>
		</div>
		<button class="menu-toggle" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Toggle menu">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
		</button>
	</div>
</nav>

<div class="app-layout">
	<aside class="sidebar" class:open={sidebarOpen}>
		<div class="sidebar-header">Core</div>
		{#each coreLessons as lesson}
			{@const pct = progress.getCompletionPercent($progress, lesson.id, lesson.steps.length)}
			{@const active = page.url.pathname === `/lessons/${lesson.slug}`}
			<a href="/lessons/{lesson.slug}" class="sidebar-item" class:active onclick={() => sidebarOpen = false}>
				<div class="sidebar-progress-ring">
					<svg width="28" height="28" viewBox="0 0 28 28">
						<circle cx="14" cy="14" r="11" fill="none" stroke="var(--border)" stroke-width="2"/>
						<circle cx="14" cy="14" r="11" fill="none" stroke={lesson.color} stroke-width="2"
							stroke-dasharray={`${(pct / 100) * 69.1} 69.1`}
							stroke-linecap="round" transform="rotate(-90 14 14)"/>
					</svg>
					<span class="sidebar-pct">{pct}</span>
				</div>
				<div class="sidebar-label">
					<span class="sidebar-domain" style="color: {lesson.color}">{lesson.title}</span>
					<span class="sidebar-tools">{lesson.toolCount > 0 ? `${lesson.toolCount} tools` : 'patterns'}</span>
				</div>
			</a>
		{/each}
		<div class="sidebar-header sidebar-header-domains">Domains</div>
		{#each domainLessons as lesson}
			{@const pct = progress.getCompletionPercent($progress, lesson.id, lesson.steps.length)}
			{@const active = page.url.pathname === `/lessons/${lesson.slug}`}
			<a href="/lessons/{lesson.slug}" class="sidebar-item" class:active onclick={() => sidebarOpen = false}>
				<div class="sidebar-progress-ring">
					<svg width="28" height="28" viewBox="0 0 28 28">
						<circle cx="14" cy="14" r="11" fill="none" stroke="var(--border)" stroke-width="2"/>
						<circle cx="14" cy="14" r="11" fill="none" stroke={lesson.color} stroke-width="2"
							stroke-dasharray={`${(pct / 100) * 69.1} 69.1`}
							stroke-linecap="round" transform="rotate(-90 14 14)"/>
					</svg>
					<span class="sidebar-pct">{pct}</span>
				</div>
				<div class="sidebar-label">
					<span class="sidebar-domain" style="color: {lesson.color}">{lesson.domain}</span>
					<span class="sidebar-tools">{lesson.toolCount} tools</span>
				</div>
			</a>
		{/each}
	</aside>
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.topnav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(10, 14, 13, 0.85);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
	}
	.topnav-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1.5rem;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 1rem;
		color: var(--text-primary);
		text-decoration: none;
	}
	.training-badge {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--accent);
		background: var(--accent-glow-strong);
		padding: 2px 8px;
		border-radius: 10px;
		border: 1px solid rgba(74, 222, 128, 0.2);
	}
	.topnav-links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}
	.topnav-links a {
		font-size: 0.85rem;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color 0.2s;
	}
	.topnav-links a:hover { color: var(--text-primary); }
	.menu-toggle {
		display: none;
		background: none;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.app-layout {
		display: flex;
		padding-top: 56px;
		min-height: 100vh;
		position: relative;
		z-index: 1;
	}

	.sidebar {
		position: fixed;
		top: 56px;
		left: 0;
		bottom: 0;
		width: 220px;
		background: rgba(15, 20, 18, 0.7);
		backdrop-filter: blur(8px);
		border-right: 1px solid var(--border);
		overflow-y: auto;
		padding: 12px 0;
		z-index: 50;
	}
	.sidebar-header {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		padding: 8px 16px 12px;
	}
	.sidebar-header-domains {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 16px;
		text-decoration: none;
		transition: background 0.15s;
	}
	.sidebar-item:hover { background: var(--bg-hover); }
	.sidebar-item.active { background: var(--accent-glow); border-right: 2px solid var(--accent); }
	.sidebar-progress-ring {
		position: relative;
		width: 28px;
		height: 28px;
		flex-shrink: 0;
	}
	.sidebar-pct {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 0.55rem;
		color: var(--text-muted);
	}
	.sidebar-label { display: flex; flex-direction: column; }
	.sidebar-domain { font-size: 0.8rem; font-weight: 500; }
	.sidebar-tools { font-size: 0.65rem; color: var(--text-muted); }

	.main-content {
		flex: 1;
		margin-left: 220px;
		max-width: 800px;
		padding: 2rem 2rem 4rem;
		overflow-y: auto;
		height: calc(100vh - 56px);
	}

	@media (max-width: 768px) {
		.topnav-links { display: none; }
		.menu-toggle { display: block; }
		.sidebar {
			transform: translateX(-100%);
			transition: transform 0.2s;
		}
		.sidebar.open { transform: translateX(0); }
		.main-content { margin-left: 0; padding: 1.5rem 1rem 3rem; }
	}
</style>
