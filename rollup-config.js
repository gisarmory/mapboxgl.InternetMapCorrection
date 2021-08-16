
import rollupGitVersion from 'rollup-plugin-git-version'
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

let release;

// Skip the git branch+rev in the banner when doing a release build
if (process.env.NODE_ENV === 'release') {
	release = true;
} else {
	release = false;
}

export default {
	input: 'src/gcj02TileLayer.js',	// 入口文件
	output: [
		{
			file: 'dist/gcj02TileLayer-src.js',	// 出口文件
			format: 'umd',	// 代码打包时的格式，这个格式可以前后端通用，除此之外还有其他格式：cjs，iife，es，amd, umd
			name: 'gcj02TileLayer',	// 包的名字,
			sourcemap: true
		}
	],
	legacy: true, // Needed to create files loadable by IE8
	plugins: [
		release ? json() : rollupGitVersion(),
        resolve(),		//此插件可以将引用库中的文件进行打包
        commonjs(),
		babel({
            exclude: 'node_modules/**',
        }),
	]
};
