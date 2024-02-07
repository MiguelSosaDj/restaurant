const { defineConfig } = require('@vue/cli-service')

module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|svg)$/i)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '[name].[hash].[ext]',
      })
      .end();
  },
};
