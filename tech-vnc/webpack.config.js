const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/js/tech-vnc-standalone.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'tech-vnc.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};
