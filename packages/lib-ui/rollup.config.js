import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import pkg from './package.json';

const config = ({ output, format }) => ({
  input: 'src/index.js',
  output: {
    name: pkg.name,
    file: output,
    format,
    sourcemap: true,
    globals: {
      'prop-types': 'PropTypes',
      react: 'React',
    },
  },
  external: [
    '@chakra-ui/core',
    '@emotion/core',
    '@emotion/styled',
    'emotion-theming',
    'prop-types',
    'react',
    'react-dom',
    'react-icons',
  ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs(),
    visualizer({
      filename: `.stats/${pkg.name}.${format}.html`,
      title: `${pkg.name} [${format}]`,
    }),
    terser(),
  ],
});

export default [
  config({ output: pkg.main, format: 'cjs' }),
];
