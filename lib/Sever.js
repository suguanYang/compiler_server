const http = require("http");
const path = require("path");
// const _ = require("underscore");
const express = require("express");
const logger = require("./utils/logger").getInstance();
// const mime = require("mime");

const {
  COMPILER_RUN,
  COMPILER_ERROR,
  COMPILER_COMPLETE,
} = require("./events/eventsConstants");

module.exports = class Server {
  constructor(compiler) {
    this.app = express();
    this.log = logger;
    this.compiler = compiler;

    this.createServerLogger();
    this.createAssetsRouter();
    // this.app.use(this.compiler.middleware);
  }

  createServerLogger() {
    this.app.use((req, res, next) => {
      this.log.info(req.path);
      next();
    });
  }

  start(port = 63352, host = "127.0.0.1") {
    http.createServer(this.app);
    const server = this.app.listen(port, host, () => {
      this.log.info(
        new Date().toLocaleTimeString()
        + " Tests are running at http://localhost:%d/",
        port
      );
    });

    return server;
  }
};
