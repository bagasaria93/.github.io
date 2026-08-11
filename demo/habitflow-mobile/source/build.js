const esbuild = require('esbuild');
esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: '../bundle.js',
  minify: true,
  sourcemap: false,
  jsx: 'automatic',
  define: {
    'process.env.NODE_ENV': '"production"',
    '__DEV__': 'false',
  },
  platform: 'browser',
  target: ['es2018'],
  mainFields: ['browser', 'module', 'main'],
  conditions: ['browser'],
  loader: { '.js': 'jsx' },
}).then(() => {
  console.log('BUILD_OK');
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
