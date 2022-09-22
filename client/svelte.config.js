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
			pages: 'docs',
			assets: 'docs',
			domain: null,
			jekyll: false,
			fallback: null,
			precompress: false,
		}),
		prerender: {
			entries: ["*"]
		},
		trailingSlash: 'always',
	}
};

export default config;
