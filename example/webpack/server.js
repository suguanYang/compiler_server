const webpack = require("webpack");
const CompilerServer = require("../../lib/Sever");
const WebpackCompiler = require("../../lib/bundler/WebpackCompiler");

const webpackOptions = require("./webpack.config");

const compiler = new WebpackCompiler(webpack(webpackOptions), webpackOptions);

const server = new CompilerServer(compiler, webpackOptions);

server.start();