const { Signale } = require("signale");
const DEV = process.env.NODE_ENV !== "production";

let _signale = null;

module.exports = class SignaleSingleton {
  constructor() {
    // this._logger = {};
    // SignaleSingleton.instance = new Signale();
  }

  static get instance() {
    return _signale;
  }

  static set instance(ins) {
    const _logger = {};
    _logger.info = function(...args) {
      if (!DEV) {
        return;
      }
      ins.info(...args);
    };
    _logger.debug = function(...args) {
      if (!DEV) {
        return;
      }
      ins.debug(...args);
    };
    _logger.error = function(...args) {
      if (!DEV) {
        return;
      }
      ins.error(...args);
    };
    _signale = _logger;
  }

  static getInstance() {
    if (SignaleSingleton.instance === null) {
      SignaleSingleton.instance = new Signale();
    }

    return SignaleSingleton.instance;
  }

};
