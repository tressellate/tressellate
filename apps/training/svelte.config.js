import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'public',
			assets: 'public',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	}
};

export default config;
