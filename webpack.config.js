const packageJson = require("./package.json");
const cwd = process.cwd();
const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { VueLoaderPlugin } = require('vue-loader')
const os = require("os");
const qlikExtensionPath = os.homedir() + "/Documents/Qlik/Sense/Extensions";

function formatDate(date) {
    return date.getFullYear() + "-" +
        (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-" +
        (date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate())
}
module.exports = (env, argv) => {
    const PRODUCTION = argv.mode === "production";

    const extName = packageJson.extensionMetaInfo.extName;
    let d = new Date();
    let qext = {
        "name": packageJson.extensionMetaInfo.visualName,
        "description": `${packageJson.extensionMetaInfo.description}\nv${packageJson.version} (${formatDate(d)})`,
        "type": "visualization",
        "version": packageJson.version,
        "author": packageJson.author,
        "icon": packageJson.extensionMetaInfo.icon,
        "bundle": packageJson.extensionMetaInfo.bundle,
    }
    if (packageJson.extensionMetaInfo.preview) {
        qext["preview"] = packageJson.extensionMetaInfo.preview;
    }
    if (packageJson.extensionMetaInfo.iconPath) {
        qext["iconPath"] = packageJson.extensionMetaInfo.iconPath;
    }

    let plugins = [
        new MiniCssExtractPlugin({
            filename: _ => `${extName}.css`
        }),
        new webpack.DefinePlugin({
            "process.env.APP_NAME": JSON.stringify(extName),
            "process.env.VERSION": JSON.stringify(packageJson.version),
            "__VUE_PROD_DEVTOOLS__": false,
            "__VUE_OPTIONS_API__": true,
        }),
        new GenerateJsonPlugin(`${extName}.qext`, qext),
        new CopyPlugin({
            patterns: packageJson.extensionMetaInfo.preview ? ["./" + packageJson.extensionMetaInfo.preview] : [],
        }),
        new VueLoaderPlugin()
    ]
    if (PRODUCTION) {
        plugins.push(
            new ZipPlugin({
                path: path.join(cwd, './build'),
                filename: extName + '_' + packageJson.version + '.zip',
            })
        )
    }

    let optimization = {}
    if (PRODUCTION) {
        optimization = Object.assign(optimization, {
            minimizer: [new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            }), new CssMinimizerPlugin()]
        })
    }

    return {
        entry: path.join(cwd, "index.ts"),
        output: {
            filename: extName + ".js",
            path: path.join(qlikExtensionPath, extName),
            libraryTarget: 'umd',
            publicPath: ''
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        target: ["web", "es5"],
        plugins: plugins,
        optimization: optimization,
        module: {
            rules: [
                // Babel
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            "presets": [
                                "@babel/preset-typescript",
                            ]
                        }

                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    options: { appendTsSuffixTo: [/\.vue$/] }
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader'
                },
                {
                    enforce: 'pre',
                    test: /\.m?js$/,
                    use: [
                        {
                            loader: "source-map-loader",
                            options: {
                                filterSourceMappingUrl: (url, resourcePath) => {
                                    if (resourcePath.includes('zxing') || resourcePath.includes('custom-error')) {
                                        return false;
                                    }
                                    return true;
                                },
                            },
                        },
                    ],
                },
                //  MiniCssExtractPlugin (Less)
                {
                    test: /\.(less)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: {
                                    filter: (url, resourcePath) => {
                                        if (url.includes(".svg") || url.includes(".eot")) {
                                            return false;
                                        }
                                        return true;
                                    }
                                },
                            }
                        },
                        "less-loader"
                    ]
                },
                //  MiniCssExtractPlugin (Css)
                {
                    test: /\.(css)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: {
                                    filter: (url, resourcePath) => {
                                        if (url.includes(".svg") || url.includes(".eot")) {
                                            return false;
                                        }
                                        return true;
                                    }
                                },
                            }
                        },
                        "less-loader",
                        {
                            loader: 'string-replace-loader',
                            options: {
                                multiple: [
                                    { search: 'url\\(\\"[^\\)]*\\"\\) format\\(\\"woff2\\"\\),', replace: '', flags: 'g' },
                                ]
                            }
                        },
                    ]
                },
                // assets (images)
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },
                // assets (webfonts)
                {
                    test: /\.(woff|woff2|ttf|otf)$/i,
                    type: 'asset/resource',
                },
                // Html loader
                {
                    test: /\.html/,
                    use: ["html-loader"]
                },
                // Assets qext
                {
                    test: /\.qext$/,
                    type: 'asset/resource',
                    generator: {
                        filename: '[name][ext]'
                    }
                },
            ]
        },
        externals: {
            qlik: "qlik",
            qr: "require",
            jquery: "jquery",
            qvangular: "qvangular"
        }
    }
};