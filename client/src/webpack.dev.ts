import common, { Configuration } from './webpack.common'

import path from 'path'
import 'webpack-dev-server'
import { merge } from 'webpack-merge'


const config: Configuration = {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '../dist/client'),
        },
        hot: true,
    },
}

module.exports = merge(common, config)