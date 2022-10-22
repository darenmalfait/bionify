const BABEL_ENV = process.env.BABEL_ENV
const isCommonJS = BABEL_ENV !== undefined && BABEL_ENV === 'cjs'
const isESM = BABEL_ENV !== undefined && BABEL_ENV === 'esm'

module.exports = function (api) {
  const isTest = api.env('test')
  // You can use isTest to determine what presets and plugins to use.

  if (isTest) {
    return {
      presets: ['@babel/env', '@babel/preset-typescript'],
    }
  }

  const presets = [
    [
      '@babel/env',
      {
        loose: true,
        modules: isCommonJS ? 'commonjs' : false,
        targets: {
          esmodules: isESM ? true : undefined,
        },
      },
    ],
    '@babel/preset-typescript',
  ]

  const plugins = [['@babel/plugin-proposal-class-properties', { loose: true }]]

  return {
    presets,
    plugins,
  }
}
