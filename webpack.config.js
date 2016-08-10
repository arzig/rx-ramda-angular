module.exports = {
    entry: "./ng-app",
    output: {
        filename: "ng-app-built.js",
    },
    devtool: "inline-source-map",
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
}
