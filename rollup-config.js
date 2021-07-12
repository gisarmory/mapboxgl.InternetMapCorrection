// Config file for running Rollup in "normal" mode (non-watch)

import rollupGitVersion from 'rollup-plugin-git-version'
import json from 'rollup-plugin-json'
import pkg from 'package.json'
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';

let version = pkg.version;

let release;

// Skip the git branch+rev in the banner when doing a release build
if (process.env.NODE_ENV === 'release') {
	release = true;
} else {
	release = false;
}

const banner = `/* @preserve
 * RunMap ${version}, a JS library for interactive maps.
 */
`;

// const outro = `var oldrmap = window.L.rmap;
// exports.noConflict = function() {
// 	window.L.rmap = oldrmap;
// 	return this;
// }

// Always export us to window global (see #2364)
// window.L.rmap = exports;`;

export default {
	input: 'src/rasterTileLayer.js',	// 入口文件
	output: [
		{
			file: 'dist/mapboxgl.-src.js',	// 出口文件
			format: 'umd',	// 代码打包时的格式，这个格式可以前后端通用，除此之外还有其他格式：cjs，iife，es，amd, umd
			name: 'mapboxgl',	// 包的名字,
			// banner: banner,
			// outro: outro,
			sourcemap: true
		// }, {
		// 	file: pkg.main + 'rmap-src.esm.js',
		// 	format: 'es',
		// 	banner: banner,
		// 	sourcemap: true
		}
	],
	legacy: true, // Needed to create files loadable by IE8
	plugins: [
		release ? json() : rollupGitVersion(),
        resolve(),		//此插件可以将引用库中的文件进行打包
        // commonjs(),
		babel({
            exclude: 'node_modules/**',
        }),
	]
};
