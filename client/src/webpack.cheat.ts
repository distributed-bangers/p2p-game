import { Configuration } from './webpack.common'

import path from 'path'

const config: Configuration = {
    entry: './src/lookAheadCheatingClient.ts',

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three'),
        },
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../dist/lookAheadCheatingClient'),
    },
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '../dist/lookAheadCheatingClient'),
        },
        hot: true,
    },
}

export default config