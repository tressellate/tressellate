<script lang="ts">
	let { name, color = 'var(--accent)' }: { name: string; color?: string } = $props();
</script>

<span class="chip" style="--chip-color: {color}">
	{name}
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--chip-color);
		background: color-mix(in srgb, var(--chip-color) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--chip-color) 20%, transparent);
		padding: 3px 10px;
		border-radius: 12px;
	}
</style>
