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
        library: 'ImmersiveReader',
        filename: 'immersive-reader.js',
    }
};