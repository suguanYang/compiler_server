// const fs = require("fs");
const webpack = require("webpack");
const { setFs } = require("../fs/index");
const EventEmitter = require("events").EventEmitter;
const logger = require("../utils/logger").getInstance();
const path = require("path");
const mime = require("mime");
// const webpackDevMiddleware = require("webpack-dev-middleware");
const {
  getFilenameFromUrl,
  handleRangeHeaders,
  handleRequest,
} = require("../utils/index.js");
const parseRange = require("range-parser");

const {
  COMPILER_RUN,
  COMPILER_ERROR,
  COMPILER_COMPLETE,
} = require("../events/eventsConstants");

module.exports = class WebpackBundler extends EventEmitter {
  constructor(compiler, options) {
    super();
    this.log = logger;
    this.options = options;
    this.webpackCompiler = compiler;

    this.watch();
    this.listenProgress();
  }

  start() {
    this.emit(COMPILER_RUN);
    return new Promise((resolve, reject) => {
      this.webpackCompiler.run((err, stats) => {
        this.log.info("stats: ", stats);
        if (err) {
          this.emit(COMPILER_ERROR, err);
          reject(err);
        } else {
          this.emit(COMPILER_COMPLETE, stats);
          resolve(stats);
        }
      });
    });
  }

  watch(opt) {
    this.emit(COMPILER_RUN);
    return new Promise((resolve, reject) => {
      this.webpackCompiler.watch(opt, (err, stats) => {
        if (err) {
          this.emit(COMPILER_ERROR);
          reject(err);
        } else {
          this.emit(COMPILER_COMPLETE);
          resolve(stats);
        }
      });
      setFs(this, this.webpackCompiler);
    });
  }

  middleware(req, res, next) {
    let filename = getFilenameFromUrl(this.options.output.publicPath, this.webpackCompiler, req.url);
    if (filename === false) {
      return next();
    }
    return new Promise((resolve) => {
      handleRequest(this.webpackCompiler, filename, processRequest, req);
      function processRequest() {
        try {
          let stat = this.webpackCompiler.statSync(filename);

          if (!stat.isFile()) {
            if (stat.isDirectory()) {
              let { index } = this.webpackCompiler.options;

              if (index === undefined || index === true) {
                index = "index.html";
              } else if (!index) {
                throw new Error("next");
              }

              filename = path.posix.join(filename, index);
              stat = this.webpackCompiler.fs.statSync(filename);
              if (!stat.isFile()) {
                throw new Error("next");
              }
            } else {
              throw new Error("next");
            }
          }
        } catch (e) {
          return resolve(next());
        }

        // server content
        let content = this.webpackCompiler.fs.readFileSync(filename);
        content = handleRangeHeaders(content, req, res);

        let contentType = mime.getType(filename);

        // do not add charset to WebAssembly files, otherwise compileStreaming will fail in the client
        if (!/\.wasm$/.test(filename)) {
          contentType += "; charset=UTF-8";
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Length", content.length);

        const { headers } = this.webpackCompiler.options;
        if (headers) {
          for (const name in headers) {
            if ({}.hasOwnProperty.call(headers, name)) {
              res.setHeader(name, this.webpackCompiler.options.headers[name]);
            }
          }
        }
        // Express automatically sets the statusCode to 200, but not all servers do (Koa).
        res.statusCode = res.statusCode || 200;
        if (res.send) res.send(content);
        else res.end(content);
        resolve();
      }
    });
  }

  listenProgress() {
    const progressPlugin = new webpack.ProgressPlugin(
      (percent, msg, addInfo) => {
        percent = Math.floor(percent * 100);

        if (percent === 100) {
          msg = "Compilation completed";
        }

        if (addInfo) {
          msg = `${msg} (${addInfo})`;
        }
        this.log.info(msg);
      }
    );
    progressPlugin.apply(this.webpackCompiler);
  }
};

