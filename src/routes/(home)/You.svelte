<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<div class="simplify">
	<h2>Clubsaurus helps you find you<span class="highlighted">.</span></h2>
	<div class="button">
		<Button href="/get-started" value="Get Started" />
	</div>
</div>

<style lang="scss">
	h2 {
		text-align: center;
	}

	.simplify {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		background: var(--bg);
		box-sizing: border-box;
		height: 50vh;
		position: relative;
		border-top: 1px solid black;
		border-bottom: 1px solid black;

		h2 {
			background: var(--bg);
			font-weight: 500;
			font-size: 2rem;
		}
	}

	.button {
		max-width: 400px;
		margin: 0 1rem;
	}

	.highlighted {
		color: var(--accent);
	}
</style>
