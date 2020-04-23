import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

// Comments in package.json looks awkward, so placing comment here:
// This seems to be the minimum effort required with the least amount of dependencies to
// generate a minimized js bundle out of standard es modules that have dependencies which are
// themselves es modules. Using npm to manage dependencies and rollup+terser to package into
// a minimized bundle
export default {
	input: 'js/script.js',
	output: {
		file: 'js/script.bundle.min.js',
		format: 'es',
		sourcemap: true,
	},
	plugins: [
		resolve(),
		terser({
			// This avoids costly AST transformations. This has little impact here,
			// but it can improve build time without significantly increasing file size.
			compress: false,
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
	],
};