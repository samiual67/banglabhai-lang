const KEYWORDS = [
  "porerta dekh bhai", "bhai eta holo", "jotokkhon bhai", "othoba bhai",
  "nahoy bhai", "shuru bhai", "shesh bhai", "dekha bhai", "jodi bhai", "thamo bhai"
];
const TWO = ["==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "&&", "||"];
const ONE = "+-*/%<>=(){};,!";

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (src.startsWith("//", i)) {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "\"") {
      let j = i + 1;
      while (j < src.length && src[j] !== "\"") j++;
      if (j >= src.length) throw new Error("String shesh hoyni");
      tokens.push({ type: "STRING", value: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ type: "NUMBER", value: Number(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const kw = KEYWORDS.find(k => src.startsWith(k, i) && !/[A-Za-z0-9_]/.test(src[i + k.length] || ""));
      if (kw) {
        tokens.push({ type: "KEYWORD", value: kw });
        i += kw.length;
        continue;
      }
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const w = src.slice(i, j);
      if (w === "thik") tokens.push({ type: "BOOL", value: true });
      else if (w === "vul") tokens.push({ type: "BOOL", value: false });
      else if (w === "faka") tokens.push({ type: "NULL", value: null });
      else tokens.push({ type: "IDENT", value: w });
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (TWO.includes(two)) { tokens.push({ type: "OP", value: two }); i += 2; continue; }
    if (ONE.includes(ch)) { tokens.push({ type: "OP", value: ch }); i++; continue; }
    throw new Error("Ojana character: " + ch);
  }
  return tokens;
}

module.exports = { tokenize };