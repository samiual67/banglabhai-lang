function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const next = () => tokens[p++];
  const isKw = (v) => peek() && peek().type === "KEYWORD" && peek().value === v;
  const isOp = (v) => peek() && peek().type === "OP" && peek().value === v;
  const expectKw = (v) => { if (!isKw(v)) throw new Error(v + " lagbe"); next(); };
  const expectOp = (v) => {
    if (!isOp(v)) throw new Error(v + " lagbe, pawa gelo: " + (peek() ? peek().value : "kichu na"));
    next();
  };

  function program() {
    expectKw("shuru bhai");
    const body = [];
    while (peek() && !isKw("shesh bhai")) body.push(statement());
    expectKw("shesh bhai");
    return { type: "Program", body };
  }

  function block() {
    expectOp("{");
    const body = [];
    while (peek() && !isOp("}")) body.push(statement());
    expectOp("}");
    return { type: "Block", body };
  }

  function statement() {
    if (isOp("{")) return block();
    if (isKw("bhai eta holo")) {
      next();
      const t = next();
      if (!t || t.type !== "IDENT") throw new Error("Variable er nam lagbe");
      let init = null;
      if (isOp("=")) { next(); init = expr(); }
      expectOp(";");
      return { type: "VarDecl", name: t.value, init };
    }
    if (isKw("dekha bhai")) {
      next();
      const args = [expr()];
      while (isOp(",")) { next(); args.push(expr()); }
      expectOp(";");
      return { type: "Print", args };
    }
    if (isKw("jodi bhai")) return ifStatement();
    if (isKw("jotokkhon bhai")) {
      next();
      expectOp("(");
      const test = expr();
      expectOp(")");
      return { type: "While", test, body: block() };
    }
    if (isKw("thamo bhai")) { next(); expectOp(";"); return { type: "Break" }; }
    if (isKw("porerta dekh bhai")) { next(); expectOp(";"); return { type: "Continue" }; }
    const e = expr();
    expectOp(";");
    return { type: "ExprStmt", expr: e };
  }

  function ifStatement() {
    next();
    expectOp("(");
    const test = expr();
    expectOp(")");
    const consequent = block();
    let alternate = null;
    if (isKw("othoba bhai")) alternate = ifStatement();
    else if (isKw("nahoy bhai")) { next(); alternate = block(); }
    return { type: "If", test, consequent, alternate };
  }

  function expr() {
    const t = peek();
    const n = tokens[p + 1];
    if (t && t.type === "IDENT" && n && n.type === "OP" && ["=", "+=", "-=", "*=", "/="].includes(n.value)) {
      next();
      const op = next().value;
      return { type: "Assign", op, name: t.value, value: expr() };
    }
    return binary(() => binary(() => binary(() => binary(() => binary(() => binary(unary, ["*", "/", "%"]), ["+", "-"]), ["<", ">", "<=", ">="]), ["==", "!="]), ["&&"]), ["||"]);
  }

  function binary(sub, ops) {
    let left = sub();
    while (peek() && peek().type === "OP" && ops.includes(peek().value)) {
      const op = next().value;
      left = { type: "Binary", op, left, right: sub() };
    }
    return left;
  }

  function unary() {
    if (isOp("-") || isOp("!")) {
      const op = next().value;
      return { type: "Unary", op, arg: unary() };
    }
    return primary();
  }

  function primary() {
    const t = next();
    if (!t) throw new Error("Expression ashha korechilam, kintu code shesh");
    if (t.type === "NUMBER" || t.type === "STRING" || t.type === "BOOL" || t.type === "NULL") return { type: "Literal", value: t.value };
    if (t.type === "IDENT") return { type: "Ident", name: t.value };
    if (t.type === "OP" && t.value === "(") {
      const e = expr();
      expectOp(")");
      return e;
    }
    throw new Error("Ashha korini: " + t.value);
  }

  return program();
}

module.exports = { parse };
