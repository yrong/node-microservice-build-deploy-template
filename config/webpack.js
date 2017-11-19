const fs = require('fs')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

let mods = {};
fs.readdirSync("node_modules")
    .filter(x => [".bin"].indexOf(x) === -1)
    .forEach(mod => {
        mods[mod] = "commonjs " + mod;
    });

const devtool='source-map'
let plugins = [
    new UglifyJSPlugin({
        sourceMap: devtool && (devtool.indexOf("sourcemap") >= 0 || devtool.indexOf("source-map") >= 0)
    }),
    new CleanWebpackPlugin(['build']),
    new GitRevisionPlugin(),
    new WebpackShellPlugin({onBuildEnd:[`/bin/bash ./config/postbuild.sh`]})
];

module.exports = (entry, packages) => {
    plugins = [...plugins,new CopyWebpackPlugin(packages, {ignore: ['*.gitignore']}),]
    return {
        target: 'node',
        entry: entry,
        devtool: devtool,
        output: {
            path: path.resolve('./build'),
            filename: '[name].js'
        },
        node: {
            __filename: true,
            __dirname: true
        },
        externals: mods,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ]
        },
        plugins: plugins
    };
}