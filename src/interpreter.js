class BreakSignal {}
class ContinueSignal {}

class Scope {
  constructor(parent) { this.vars = new Map(); this.parent = parent; }
  declare(name, value) { this.vars.set(name, value); }
  find(name) {
    let s = this;
    while (s) { if (s.vars.has(name)) return s; s = s.parent; }
    return null;
  }
  get(name) {
    const s = this.find(name);
    if (!s) throw new Error(name + " declare kora hoyni");
    return s.vars.get(name);
  }
  set(name, value) {
    const s = this.find(name);
    if (!s) throw new Error(name + " declare kora hoyni");
    s.vars.set(name, value);
  }
}

function show(v) {
  if (v === null) return "faka";
  if (v === true) return "thik";
  if (v === false) return "vul";
  return String(v);
}

function evaluate(node, scope) {
  switch (node.type) {
    case "Literal": return node.value;
    case "Ident": return scope.get(node.name);
    case "Unary": {
      const v = evaluate(node.arg, scope);
      return node.op === "-" ? -v : !v;
    }
    case "Assign": {
      const v = evaluate(node.value, scope);
      let result = v;
      if (node.op !== "=") result = calc(node.op[0], scope.get(node.name), v);
      scope.set(node.name, result);
      return result;
    }
    case "Binary": {
      if (node.op === "&&") {
        const l = evaluate(node.left, scope);
        return l ? evaluate(node.right, scope) : l;
      }
      if (node.op === "||") {
        const l = evaluate(node.left, scope);
        return l ? l : evaluate(node.right, scope);
      }
      return calc(node.op, evaluate(node.left, scope), evaluate(node.right, scope));
    }
  }
  throw new Error("Ojana expression: " + node.type);
}

function calc(op, a, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) throw new Error("Shunno diye bhag kora jay na");
      return a / b;
    case "%": return a % b;
    case "<": return a < b;
    case ">": return a > b;
    case "<=": return a <= b;
    case ">=": return a >= b;
    case "==": return a === b;
    case "!=": return a !== b;
  }
  throw new Error("Ojana operator: " + op);
}

function exec(node, scope) {
  switch (node.type) {
    case "Program":
      for (const s of node.body) exec(s, scope);
      return;
    case "Block": {
      const inner = new Scope(scope);
      for (const s of node.body) exec(s, inner);
      return;
    }
    case "VarDecl":
      scope.declare(node.name, node.init ? evaluate(node.init, scope) : null);
      return;
    case "Print":
      console.log(node.args.map(a => show(evaluate(a, scope))).join(" "));
      return;
    case "ExprStmt":
      evaluate(node.expr, scope);
      return;
    case "If":
      if (evaluate(node.test, scope)) exec(node.consequent, scope);
      else if (node.alternate) exec(node.alternate, scope);
      return;
    case "While":
      while (evaluate(node.test, scope)) {
        try {
          exec(node.body, scope);
        } catch (e) {
          if (e instanceof BreakSignal) break;
          if (e instanceof ContinueSignal) continue;
          throw e;
        }
      }
      return;
    case "Break": throw new BreakSignal();
    case "Continue": throw new ContinueSignal();
  }
  throw new Error("Ojana statement: " + node.type);
}

function run(ast) {
  exec(ast, new Scope(null));
}

module.exports = { run };