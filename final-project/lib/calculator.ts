// Calculator utility functions for evaluating expressions like "12 + 3 × 4 - 5.6"
export type Operator = "+" | "-" | "×" | "÷";

const OP_SET: Operator[] = ["+", "-", "×", "÷"];

// 判斷是否為運算符
export function isOperator(ch: string): ch is Operator {
  return OP_SET.includes(ch as Operator);
}

// Use regex to split tokens (numbers / operators)
export function tokenize(expression: string): string[] {
  const trimmed = expression.replace(/\s+/g, "");
  if (!trimmed) return [];

  // 先確保內容只包含數字、小數點和運算符
  if (/[^0-9.+\-×÷]/.test(trimmed)) {
    throw new Error("Expression contains invalid characters");
  }

  const rawTokens = trimmed.match(/(\d*\.?\d+|[+\-×÷])/g);
  if (!rawTokens) return [];

  // 處理一元負號：開頭或前一個 token 為運算符時的 "-"
  const tokens: string[] = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i];
    if (
      t === "-" &&
      (i === 0 || isOperator(rawTokens[i - 1] as string))
    ) {
      const next = rawTokens[i + 1];
      if (next && !isOperator(next)) {
        tokens.push((-parseFloat(next)).toString());
        i++; // skip next
      } else {
        throw new Error("Invalid unary minus position");
      }
    } else {
      tokens.push(t);
    }
  }

  return tokens;
}

// 驗證下一個輸入字元是否允許（不考慮空白，只看 expression 字串本身）
export function canAppendChar(expression: string, next: string): boolean {
  const expr = expression.replace(/\s+/g, "");

  if (next === "") return true;

  const last = expr[expr.length - 1];

  // 數字
  if (/[0-9]/.test(next)) return true;

  // 小數點：同一段數字只能出現一次
  if (next === ".") {
    // 找到最後一個運算符之後的數字段
    const afterLastOp = expr.split(/[+\-×÷]/).pop() ?? "";
    return afterLastOp.indexOf(".") === -1;
  }

  // 運算符
  if (isOperator(next)) {
    if (!expr) {
      // 開頭只允許 "-"（表示負號）
      return next === "-";
    }

    // 上一個也是運算符 → 不允許（避免 ++、×÷ 等）
    if (isOperator(last)) return false;

    return true;
  }

  // 其他字元一律不允許
  return false;
}

// Backspace：刪除最後一個字元
export function backspace(expression: string): string {
  if (!expression) return "";
  return expression.slice(0, -1);
}

// AC：清空輸入
export function clearExpression(): string {
  return "";
}

// evaluate(): 計算整段字串；傳回 number，若表達式不合法則丟出 Error。
export function evaluate(expression: string): number {
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new Error("Empty expression");
  }

  // tokens 交錯：number op number op number ...
  if (tokens.length % 2 === 0) {
    throw new Error("Expression ends with operator");
  }

  const numbers: number[] = [];
  const operators: Operator[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (isOperator(t)) {
      operators.push(t);
    } else {
      const n = parseFloat(t);
      if (Number.isNaN(n)) {
        throw new Error(`Invalid number: ${t}`);
      }
      numbers.push(n);
    }
  }

  if (numbers.length !== operators.length + 1) {
    throw new Error("Invalid expression structure");
  }

  // 先處理乘除
  const numsPhase1: number[] = [numbers[0]];
  const opsPhase1: Operator[] = [];

  for (let i = 0; i < operators.length; i++) {
    const op = operators[i];
    const nextNum = numbers[i + 1];
    if (op === "×" || op === "÷") {
      const prev = numsPhase1.pop() as number;
      let result: number;
      if (op === "×") {
        result = prev * nextNum;
      } else {
        if (nextNum === 0) {
          throw new Error("Division by zero");
        }
        result = prev / nextNum;
      }
      numsPhase1.push(result);
    } else {
      opsPhase1.push(op);
      numsPhase1.push(nextNum);
    }
  }

  // 再處理加減
  let result = numsPhase1[0];
  for (let i = 0; i < opsPhase1.length; i++) {
    const op = opsPhase1[i];
    const n = numsPhase1[i + 1];
    if (op === "+") {
      result += n;
    } else if (op === "-") {
      result -= n;
    }
  }

  return result;
}


