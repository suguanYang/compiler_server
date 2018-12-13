// const fs = require("fs");
const webpack = require("webpack");
const { setFs } = require("../fs/index");
const EventEmitter = require("events").EventEmitter;
const logger = require("../utils/logger").getInstance();
// const webpackDevMiddleware = require("webpack-dev-middleware");
const { getFilenameFromUrl } = require("../utils/filePath");
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
      this.compiler.run((err, stats) => {
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
      setFs(this, this.compiler);
    });
  }

  middleware(req, res, next) {
    let filename = getFilenameFromUrl(this.options.output.publicPath, this.compiler, req.url);
    const basePath = this.webpackCompiler.getBasePath();
    const filesystem = this.webpackCompiler.fs;
    const content = filesystem.readdirSync(basePath);
    content.forEach((item) => {
      const p = `${basePath}/${item}`;

      if (filesystem.statSync(p).isFile()) {
        const content = filesystem.readFileSync(p);
        content = this.handleRangeHeaders()
        console.log(filesystem.readFileSync(p));
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
    progressPlugin.apply(this.compiler);
  }

  handleRangeHeaders(content, req, res) {
    // assumes express API. For other servers, need to add logic to access
    // alternative header APIs
    res.setHeader("Accept-Ranges", "bytes");

    if (req.headers.range) {
      const ranges = parseRange(content.length, req.headers.range);

      // Range Not Satisfiable
      if (ranges === -1) {
        res.setHeader("Content-Range", `bytes */${content.length}`);
        res.statusCode = 416;
      }

      // valid (syntactically invalid/multiple ranges are treated as a
      // regular response)
      if (ranges !== -2 && ranges.length === 1) {
        const { length } = content;

        // Content-Range
        res.statusCode = 206;
        res.setHeader(
          "Content-Range",
          `bytes ${ranges[0].start}-${ranges[0].end}/${length}`
        );

        content = content.slice(ranges[0].start, ranges[0].end + 1);
      }
    }

    return content;
  }
};

