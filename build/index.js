const fs = require('fs')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')
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
    new WebpackShellPlugin({onBuildEnd:[`/bin/bash ../config/build/postbuild.sh`]})
];

module.exports = (entry, packages) => {
    entry = entry||{}, entry = Object.assign(entry,{server:'./app.js'})
    plugins = [...plugins,new CopyWebpackPlugin(packages, {ignore: ['*.gitignore']})]
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
                        loader: 'babel-loader',
                        options: {
                            presets: [["env", {"targets": {"node": "current"}}]]
                        }
                    }
                }
            ]
        },
        plugins: plugins
    };
}