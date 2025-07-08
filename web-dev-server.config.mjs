export default {
  rootDir: '.',
  port: 3000,
  open: true,
  watch: true,
  nodeResolve: true,
  appIndex: './index.html',
  proxy: {
    '/exist/rest': 'http://localhost:8080/exist/rest',
  },
};