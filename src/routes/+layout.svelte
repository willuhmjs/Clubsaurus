<script lang="ts">
	import '@fontsource/work-sans/100.css';
	import '@fontsource/work-sans/200.css';
	import '@fontsource/work-sans/300.css';
	import '@fontsource/work-sans/400.css';
	import '@fontsource/work-sans/500.css';
	import '@fontsource/work-sans/600.css';
	import '@fontsource/work-sans/700.css';
	import '@fontsource/work-sans/800.css';
	import '@fontsource/work-sans/900.css';
	import '@fontsource-variable/source-code-pro';

	import { onMount } from 'svelte';

	import { addToast, resetToasts } from '$lib/components/toaster';
	import Toaster from '$lib/components/Toaster.svelte';

	import type { LayoutData } from './$types';
	export let data: LayoutData;

	let sent = false;
	resetToasts();
	if (!sent) {
		addToast({
			message:
				'Clubsaurus is in early access! <a href="https://github.com/coasterfan5/clubsaurus/issues">Report Bugs.</a>',
			type: 'warn'
		});
		if (data.beta) {
			addToast({
				message:
					'You are on a beta version. <a href="https://clubsaur.us">Click here to go to the main site.</a>',
				type: 'warn'
			});
		}
		sent = true;
	}
	onMount(() => {
		document.body.classList.add('started');
	});
</script>

<svelte:head>
	<title>Clubsaur.us</title>
</svelte:head>

<div class="wrap">
	<slot />
</div>

<div class="toaster">
	<Toaster />
</div>

<style lang="scss">
	.wrap {
		min-height: calc(100%);
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	:global(html) {
		height: 100%;
		font-family:
			Work Sans,
			sans-serif;
		--text: #f1f1f1;
		--textLight: #f1f1f1;
		--textLow: #494949;
		--textDark: #202020;
		--dark: #202020;
		--mid: #333533;
		--bg: #f1f1f1;
		--bgMid: #f8f8f8;
		--bgPure: #ffffff;
		--accent: rgba(230, 57, 70);
		--accent50: rgba(230, 57, 70, 0.5);
		--redIconFilter: invert(45%) sepia(57%) saturate(7438%) hue-rotate(337deg) brightness(94%)
			contrast(92%);
	}

	:global(h1),
	:global(h2) {
		font-weight: 500;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
	}

	:global(.ProseMirror-focused) {
		outline: 0px;
	}

	:global(.mono) {
		font-family:
			Source Code Pro Variable,
			sans-serif;
	}
	.toaster {
		position: fixed;
		z-index: 9999999999999999999;
	}
</style>
