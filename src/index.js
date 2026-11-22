#!/usr/bin/env node
const fs = require("fs");
const { tokenize } = require("./tokenizer");
const { parse } = require("./parser");
const { run } = require("./interpreter");

const file = process.argv[2];
if (!file) {
  console.log("Use: banglabhai file.bb");
  process.exit(1);
}

try {
  run(parse(tokenize(fs.readFileSync(file, "utf8"))));
} catch (e) {
  console.error("Error: " + e.message);
  process.exit(1);
}