import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/ex-pb-tify.js',
  output: {
    file: 'dist/ex-pb-tify.js',
    format: 'esm',
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
  ],
  external: [
    'lit-element',
    'lit-html/directives/unsafe-html.js',
    '@teipublisher/pb-components/src/pb-mixin.js',
  ],
};
