'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge.smart({}, {
  mode: '"development"',
  devServer: {
    proxy: {
      '/*': {
        timeout: 1800000,
        target: '"http://192.168.103.131:7080"',
        changeOrigin: true
      }
    },
  },
})
