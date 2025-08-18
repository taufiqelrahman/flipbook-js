import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/FlipBook.js',
  output: [
    {
      file: 'dist/flipbook.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/flipbook.umd.js',
      format: 'umd',
      name: 'FlipBook', // jadi window.FlipBook di browser
      exports: 'default'
    }
  ],
  plugins: [resolve(), commonjs()]
};