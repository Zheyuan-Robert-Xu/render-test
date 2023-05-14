module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['react'],
  rules: {
    indent: ['error', 2],
    eqeqeq: 'error',
    'no-console': 0,
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '__v'],
      },
    ],
  },
};
