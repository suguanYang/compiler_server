const glob = require("glob");

const defaultOptions = {
  surffixPattern: "*.test.js",
  deepth: 2,
};

function addOptions(opts) {
  const {
    surffixPattern,
    deepth,
  } = opts;
  const patterns = [];
  const maxIndex = deepth - 1;
  for (let i = 0; i < deepth; i++) {
    if (i === maxIndex) {
      patterns.push(`/${surffixPattern}`);
    } else {
      patterns.push("/*");
    }
  }

  return patterns.join("");
}

/**
 * @param {string} folder¯≤<
 * @return {Array}
 */
module.exports = function getTestScripts(folder, opts = defaultOptions) {

  const matchPattern = folder + addOptions(opts);

  const testScripts = glob.sync(matchPattern);
  return testScripts;
};