const path = require('path')
const defaultSettings = require('./src/settings.js')
const JavaScriptObfuscator = require('webpack-obfuscator')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'Trojan Panel'
const port = process.env.port || 8888
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/api': {
        target: `http://127.0.0.1:8081/api`,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  configureWebpack:
    process.env.NODE_ENV === 'production'
      ? {
          name: name,
          performance: {
            hints: 'warning',
            maxAssetSize: 300000,
            maxEntrypointSize: 650000
          },
          resolve: {
            alias: {
              '@': resolve('src')
            }
          },
          plugins: [
            // 配置项参考：https://github.com/javascript-obfuscator/javascript-obfuscator
            new JavaScriptObfuscator(
              {
                rotateStringArray: true
              },
              [
                'static/js/runtime.*.js',
                'static/js/vendor-*.js',
                'static/js/chunk-vendors.*.js'
              ]
            )
          ]
        }
      : {
          name: name,
          resolve: {
            alias: {
              '@': resolve('src')
            }
          }
        },
  chainWebpack(config) {
    // Route chunks stay truly on demand instead of being fetched immediately
    // after the first screen becomes idle.
    config.plugins.delete('prefetch')
    config.optimization.runtimeChunk('single')
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        framework: {
          name: 'vendor-framework',
          test: /[\\/]node_modules[\\/](?:vue|vue-i18n|vue-router|vuex)[\\/]/,
          chunks: 'initial',
          priority: 20,
          enforce: true,
          reuseExistingChunk: true
        },
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          priority: 10,
          enforce: true,
          reuseExistingChunk: true
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: 0,
          reuseExistingChunk: true
        }
      }
    })

    // set svg-sprite-loader
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}
