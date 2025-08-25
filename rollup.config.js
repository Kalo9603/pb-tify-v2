import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/pb-tify-v2.js',
  output: {
    file: 'dist/pb-tify-v2.js',
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
