'use strict';

const display = document.getElementById('display');
const expression = document.getElementById('expression');
let input = '0';
let stored = null;
let operator = null;
let startNewInput = false;
let hasError = false;

function render() {
  display.textContent = input;
}

function clear() {
  input = '0';
  stored = null;
  operator = null;
  startNewInput = false;
  hasError = false;
  expression.textContent = '数字を入力してください';
  render();
}

function enterNumber(value) {
  if (hasError) clear();
  if (startNewInput) {
    input = '0';
    startNewInput = false;
    if (!operator) expression.textContent = '数字を入力してください';
  }
  if (value === '.') {
    if (!input.includes('.')) input += '.';
  } else if (input.replace(/[^0-9]/g, '').length < 12) {
    input = input === '0' ? value : input + value;
  }
  render();
}

// 式を文字列として実行せず、選ばれた演算だけを行います。
function calculate(left, right, operation) {
  if (operation === '+') return left + right;
  if (operation === '−') return left - right;
  if (operation === '×') return left * right;
  if (operation === '÷') {
    if (right === 0) throw new Error('0では割れません');
    return left / right;
  }
}

function evaluate() {
  const right = Number(input);
  const label = `${stored} ${operator} ${right} =`;
  try {
    const result = calculate(stored, right, operator);
    if (!Number.isFinite(result)) throw new Error('計算できる範囲を超えました');
    // 小数の誤差を抑え、表示を最大12桁の有効数字に整えます。
    input = String(Number(result.toPrecision(12)));
    expression.textContent = label;
    stored = Number(input);
  } catch (error) {
    input = 'エラー';
    expression.textContent = error.message;
    stored = null;
    hasError = true;
  }
  operator = null;
  startNewInput = true;
  render();
}

function chooseOperator(nextOperator) {
  if (hasError) return;
  if (operator && !startNewInput) evaluate();
  if (hasError) return;
  stored = Number(input);
  operator = nextOperator;
  expression.textContent = `${stored} ${operator}`;
  startNewInput = true;
}

function equals() {
  if (operator && !startNewInput && !hasError) evaluate();
}

// クリック・タップの両方を同じ処理で受け付けます。
document.querySelector('.keys').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.number !== undefined) enterNumber(button.dataset.number);
  else if (button.dataset.op) chooseOperator(button.dataset.op);
  else if (button.dataset.action === 'clear') clear();
  else equals();
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const operations = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  if (/^[0-9.]$/.test(event.key)) enterNumber(event.key);
  else if (operations[event.key]) chooseOperator(operations[event.key]);
  else if (event.key === 'Escape' || event.key === 'Delete') clear();
  else if (event.key === '=' || event.key === 'Enter') {
    // ボタンにフォーカスがある場合、Enterは標準のクリックに任せます。
    if (event.key === 'Enter' && document.activeElement.tagName === 'BUTTON') return;
    equals();
  } else return;
  event.preventDefault();
});
