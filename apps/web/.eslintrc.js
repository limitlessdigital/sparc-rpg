const path = require("path");

module.exports = {
  root: true,
  extends: [path.join(__dirname, "../../packages/config-eslint/nextjs.js")],
};
