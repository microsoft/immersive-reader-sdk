const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/launchAsync.ts',
    module: {
        rules: [ {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        },
        {
            test: /\.ts$/,
            enforce: 'pre',
            use: [ { loader: 'tslint-loader' } ]
        } ]
    },
    output: {
        path: path.join(__dirname, 'lib'),
        library: 'ImmersiveReader',
        filename: 'index.js',
        libraryTarget: 'umd'
    }
};