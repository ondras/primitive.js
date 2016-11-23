import includePaths from "rollup-plugin-includepaths";

export default {
    entry: "js/src/app.js",
    dest: "js/app.js",
    format: "iife",
    plugins: [ includePaths() ]
};
