import adapter from '@sveltejs/adapter-auto';
import static_adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],

	kit: {
		adapter: static_adapter({
			fallback: '200.html',
			pages: 'build',
			assets: 'build',
			precompress: false,
		}),
		trailingSlash: 'always',
		paths: {
			base: '/yapms-beta'
		}
	}
};

export default config;
