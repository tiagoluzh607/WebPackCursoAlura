
const path = require('path');
const babiliPlugin = require('babili-webpack-plugin');
const extractTextPlugin = require('extract-text-webpack-plugin');
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let plugins = [];

//gerar o index.html dinamicamente com os imports baseado no main.html
plugins.push(new HtmlWebpackPlugin({
    hash: true, //ao importar os styles e os css ele vai colcoar um hash no final do nome do arquivo para invalidar o cache :)
    minify:{
        html5: true,
        collapseWhitespace: true,
        removeComments: true
    },
    filename: 'index.html',
    template: __dirname+'/main.html'
}));

plugins.push(new extractTextPlugin('styles.css'));

//disponibilizando o jquery para ser acessível de todos os módulos
plugins.push(new webpack.ProvidePlugin({
    '$': 'jquery/dist/jquery.js',
    'jQuery': 'jquery/dist/jquery.js'
}));

plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.bundle.js'
}))

let SERVICE_URL = JSON.stringify('http://localhost:3000');


//caso tenha variavefl de ambiente NODE_ENV ativa o plugin de minificação que será usado no build de produção
if(process.env.NODE_ENV == 'production'){

    SERVICE_URL = JSON.stringify('http://endereco-da-sua-api');
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin()); //Otimização

    plugins.push(new babiliPlugin());
    plugins.push(new optimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            discardComments:{
                removeAll: true
            }
        },
        canPrint: true
    }))
}

plugins.push(new webpack.DefinePlugin({
    SERVICE_URL: SERVICE_URL //passando o acesso da variavel para os módulos
}));

module.exports = {
    entry: {
        app: './app-src/app.js',
        vendor: ['jquery', 'bootstrap', 'reflect-metadata']
    },
    output:{
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
                
            },
            { 
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/font-woff' 
            },
            { 
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            { 
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'file-loader' 
            },
            { 
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml' 
            }     
        ]
    },
    plugins: plugins
}