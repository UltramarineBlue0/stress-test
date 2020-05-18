import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

// Comments in package.json looks awkward, so placing comment here:
// This seems to be the minimum effort required with the least amount of dependencies to
// generate a minimized js bundle out of standard es modules that have dependencies which are
// themselves es modules. Using npm to manage dependencies and rollup+terser to package into
// a minimized bundle
const modulePlugins = [
	resolve(),
	terser({
		// False avoids costly AST transformations. This has little impact here,
		// but it can improve build time without significantly increasing file size.
		// Also irrelevant here: if the code is "manually obfuscated" using proxies and
		// reflection - if, for example, the '.' and '()' operators are overloaded to have
		// side effects - AST transformations here would break that kind of code, because
		// it assumes "normal" js code.
		compress: true,
		mangle: true,
		output: {
			comments: false,
		},

		ecma: 2020,
		module: true,
		sourcemap: true,
		// Set these two to true to keep meaningful names in stacktraces.
		// For local dev, source map is better.
		keep_classnames: false,
		keep_fnames: false,
		warnings: "verbose",
	}),
];

export default [
	{
		input: 'js/main/main.js',
		output: {
			file: 'js/script.bundle.min.js',
			format: 'es',
			sourcemap: true,
		},
		plugins: modulePlugins,
	},
	{
		input: 'js/CPU/worker.js',
		output: {
			file: 'js/worker.min.js',
			format: 'es',
			sourcemap: true,
		},
		plugins: modulePlugins,
	},
	// TODO: switch emscripten to ES module output when firefox supports module workers
];