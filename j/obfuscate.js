var JavaScriptObfuscator = require("javascript-obfuscator");
var fs = require("fs");

var src = process.argv[2];
if (!src || !src.endsWith(".raw.js")) {
  console.log("invalid");
  console.log([src]);
  process.exit(1);
}
var dest = src.replace(/\.raw\.js$/, ".js");
var contents = fs.readFileSync(src).toString();
var obfuscationResult = JavaScriptObfuscator.obfuscate(contents, {
  compact: false,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  numbersToExpressions: true,
  simplify: true,
  stringArrayShuffle: true,
  splitStrings: true,
  stringArrayThreshold: 1,
});

var output = obfuscationResult.getObfuscatedCode();
fs.writeFileSync(dest, output);
