import React, { useState, useRef } from "react";

function LengthConversion() {
  const units = ["meter", "foot", "inch"];

  const factors = {
    meter: 1,
    foot: 0.3048,
    inch: 0.0254,
  };

  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [unit1, setUnit1] = useState("meter");
  const [unit2, setUnit2] = useState("foot");

  const [panel, setPanel] = useState("quarter");

  const [calc, setCalc] = useState("");
  const [memory, setMemory] = useState(0);

  // Ref to track the cursor position inside the input display field
  const displayRef = useRef(null);

  // ---------------- CONVERTER ----------------

  function convert(value, from, to) {
    if (value === "") return "";
    return ((Number(value) * factors[from]) / factors[to]).toFixed(4);
  }

  function firstChange(e) {
    const val = e.target.value;
    setValue1(val);
    setValue2(convert(val, unit1, unit2));
  }

  function changeFrom(e) {
    const u = e.target.value;
    setUnit1(u);
    setValue2(convert(value1, u, unit2));
  }

  function changeTo(e) {
    const u = e.target.value;
    setUnit2(u);
    setValue2(convert(value1, unit1, u));
  }

  // ---------------- CASIO ENGINE ----------------

  function formatExpression(expr) {
    return expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√/g, "Math.sqrt");
  }

  function evaluate(expr) {
    try {
      // Auto-close open parentheses for square roots if user forgot them before hitting "="
      let sanitized = expr;
      const openCount = (sanitized.match(/\(/g) || []).length;
      const closeCount = (sanitized.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        sanitized += ")".repeat(openCount - closeCount);
      }

      const formatted = formatExpression(sanitized);
      const result = Function(`"use strict"; return (${formatted})`)();
      return result === undefined || isNaN(result) ? "Error" : result;
    } catch {
      return "Error";
    }
  }

  function isOperator(c) {
    return ["+", "-", "*", "/", "×", "÷"].includes(c);
  }

  function calculate(btn) {
    if (btn === "AC") return setCalc("");

    if (btn === "MC") return setMemory(0);
    if (btn === "M+") return setMemory((m) => m + Number(evaluate(calc) || 0));
    if (btn === "M-") return setMemory((m) => m - Number(evaluate(calc) || 0));

    // Get current cursor selection ranges
    let startPos = calc.length;
    let endPos = calc.length;
    if (displayRef.current) {
      startPos = displayRef.current.selectionStart;
      endPos = displayRef.current.selectionEnd;
    }

    // 1. Backspace logic targeting current cursor position
    if (btn === "⌫") {
      let nextCalc = calc;
      let nextCursor = startPos;

      if (startPos !== endPos) {
        // If a block of text is highlighted, delete the block
        nextCalc = calc.slice(0, startPos) + calc.slice(endPos);
        nextCursor = startPos;
      } else if (startPos > 0) {
        // Delete single character behind cursor position
        nextCalc = calc.slice(0, startPos - 1) + calc.slice(startPos);
        nextCursor = startPos - 1;
      }

      setCalc(nextCalc);
      // Retain active cursor focus at deletion point
      setTimeout(() => {
        if (displayRef.current) {
          displayRef.current.focus();
          displayRef.current.setSelectionRange(nextCursor, nextCursor);
        }
      }, 0);
      return;
    }

    // 2. Square Root placement logic at cursor position
    if (btn === "√") {
      const insertion = "√(";
      const nextCalc = calc.slice(0, startPos) + insertion + calc.slice(endPos);
      setCalc(nextCalc);
      setTimeout(() => {
        if (displayRef.current) {
          displayRef.current.focus();
          displayRef.current.setSelectionRange(startPos + 2, startPos + 2);
        }
      }, 0);
      return;
    }

    // 3. Evaluation logic
    if (btn === "=") {
      setCalc(String(evaluate(calc)));
      return;
    }

    // Normalizing functional labels
    const parsedBtn = btn === "*" ? "×" : btn === "/" ? "÷" : btn;

    // Safety checks for double decimals
    if (parsedBtn === ".") {
      const leftString = calc.slice(0, startPos);
      const lastNumberChunk = leftString.split(/[\+\-\*\/×÷\(\)]/).pop();
      if (lastNumberChunk.includes(".")) return; // block duplicate point inside number
    }

    // 4. Operator swap validation at cursor location
    let leftSide = calc.slice(0, startPos);
    let rightSide = calc.slice(endPos);

    if (isOperator(parsedBtn) && leftSide.length > 0) {
      const lastChar = leftSide.slice(-1);
      if (isOperator(lastChar)) {
        // Swap back-to-back operators
        leftSide = leftSide.slice(0, -1);
        startPos -= 1;
      }
    }

    const finalCalc = leftSide + parsedBtn + rightSide;
    setCalc(finalCalc);

    // Reposition cursor instantly forward one character item
    const nextCursorLocation = startPos + parsedBtn.length;
    setTimeout(() => {
      if (displayRef.current) {
        displayRef.current.focus();
        displayRef.current.setSelectionRange(nextCursorLocation, nextCursorLocation);
      }
    }, 0);
  }

  // ---------------- LAYOUT ARRAYS ----------------

  const traditionalLayout = [
    "MC", "M-", "M+", "√",
    "AC", "⌫", "÷", "×",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", ".",
    "0", "="
  ];

  const quarterLayout = [
    "MC", "M-",
    "M+", "√",
    "AC", ".",
    "9", "8",
    "6", "7",
    "5", "4",
    "2", "3",
    "1", "0",
    "+", "-",
    "*", "/",
    "=",
  ];

  const currentButtons = panel === "quarter" ? quarterLayout : traditionalLayout;

  return (
    <>
      {/* OPEN BUTTON */}
      {panel === "hidden" && (
        <button className="calculator-open-arrow" onClick={() => setPanel("quarter")}>
          ◀
        </button>
      )}

      {/* PANEL CONTAINER */}
      <div className={`length-panel ${panel}`}>
        {panel !== "hidden" && (
          <>
            {/* TOOLBAR */}
            <div className="toolbar">
              {panel === "full" ? (
                <button onClick={() => setPanel("quarter")}>¼</button>
              ) : (
                <button onClick={() => setPanel("full")}>⛶</button>
              )}
              <button onClick={() => setPanel("hidden")}>✕</button>
            </div>

            <div className="content">
              {/* ================= CONVERTER ================= */}
              <div className={`converterCard ${panel}`}>
                <div className="converterRow">
                  <div className="box">
                    <input
                      type="number"
                      value={value1}
                      onChange={firstChange}
                      placeholder="Enter"
                    />
                    <select value={unit1} onChange={changeFrom}>
                      {units.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <button className="swapBtn">⇄</button>

                  <div className="box">
                    <input value={value2} readOnly placeholder="Result" />
                    <select value={unit2} onChange={changeTo}>
                      {units.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ================= CALCULATOR ================= */}
             {/* ================= CALCULATOR ================= */}
              <div className="calculator-wrapper">
                <div className={`calculator ${panel}`}>
                  <input
                    ref={displayRef}
                    type="text"
                    className="calc-display"
                    value={calc}
                    placeholder="0"
                    onChange={(e) => setCalc(e.target.value)} // Keep this so state and cursor tracking stay synced
                    inputMode="none" // Tells mobile devices: "Focus the field and show the cursor, but keep the keyboard hidden"
                  />

                  <div className="memory">M: {memory}</div>

                  <div className={`calc-buttons ${panel === "quarter" ? "two-col" : "four-col"}`}>
                    {currentButtons.map((btn) => {
                      let displayLabel = btn;
                      if (btn === "*") displayLabel = "×";
                      if (btn === "/") displayLabel = "÷";

                      let dynamicStyle = {};
                      if (panel === "quarter" && btn === "=") {
                        dynamicStyle = { gridColumn: "span 2" };
                      } else if (panel !== "quarter" && (btn === "0" || btn === "=")) {
                        dynamicStyle = { gridColumn: "span 2" };
                      }

                      return (
                        <button
                          key={btn}
                          onClick={() => calculate(btn)}
                          className={btn === "AC" ? "red" : ""}
                          style={dynamicStyle}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .length-panel {
          position: fixed;
          right: 0;
          top: 70px;
          height: calc(100vh - 70px);
          background: #ffffff;
          z-index: 99999;
          transition: width 0.3s ease;
          box-sizing: border-box;
        }

        .length-panel.hidden {
          width: 0 !important;
          box-shadow: none !important;
          border: none !important;
          display: none !important;
        }

        .length-panel.quarter {
          width: 25vw;
          box-shadow: -5px 0 20px rgba(0,0,0,.25);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .length-panel.full {
          width: 100vw;
          box-shadow: -5px 0 20px rgba(0,0,0,.25);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .length-panel .toolbar {
          display: flex;
          gap: 4px;
          padding: 6px;
          background: #f1f5f9;
        }

        .length-panel .toolbar button {
          flex: 1;
          height: 36px;
          border: none;
          background: #2563eb;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .calculator-open-arrow {
          position: fixed !important;
          right: 0 !important;
          top: 50% !important;
          width: 50px !important;
          height: 70px !important;
          background: #2563eb !important;
          color: white !important;
          border: 2px solid #ffffff !important;
          border-right: none !important;
          border-radius: 10px 0 0 10px !important;
          font-size: 20px !important;
          cursor: pointer !important;
          z-index: 2147483647 !important;
          display: block !important;
          box-shadow: -2px 2px 10px rgba(0,0,0,0.3) !important;
        }

        .length-panel .content {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          width: 100%;
        }

        /* ===== CONVERTER UI ===== */
        .length-panel .converterCard {
          background: #f8fafc;
          padding: 10px;
          border-radius: 14px;
          box-shadow: inset 0 0 0 1px #e2e8f0;
          width: 100%;
          box-sizing: border-box;
        }

        .length-panel .converterCard.full {
          padding: 24px;
        }

        .length-panel .converterCard.quarter .converterRow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .length-panel .converterCard.full .converterRow {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .length-panel .box {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
          box-sizing: border-box !important;
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .length-panel .converterCard.quarter input, 
        .length-panel .converterCard.quarter select {
          padding: 6px;
          font-size: 13px;
        }

        .length-panel .converterCard.full input, 
        .length-panel .converterCard.full select {
          padding: 14px;
          font-size: 18px;
          border-radius: 10px;
        }

        .length-panel input, .length-panel select {
          width: 100%;
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 6px;
        }

        .length-panel .converterCard.quarter .swapBtn {
          width: 36px;
          height: 36px;
          font-size: 16px;
          transform: rotate(90deg);
        }

        .length-panel .converterCard.full .swapBtn {
          width: 54px;
          height: 54px;
          font-size: 24px;
          transform: rotate(0deg);
          flex-shrink: 0;
        }

        .length-panel .swapBtn {
          border-radius: 12px;
          border: none;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        /* ===== CALCULATOR STYLES ===== */
        .length-panel .calculator-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          overflow: hidden;
          box-sizing: border-box;
        }

        .length-panel .calculator {
          width: 100%;
          background: #292929;
          border-radius: 12px;
          box-sizing: border-box;
          padding: 10px;
        }

        .length-panel .calculator.quarter {
          max-width: 100%;
          padding: 10px;
        }

        .length-panel .calculator.full {
          max-width: 600px;
          padding: 24px;
        }

        .length-panel .calculator.quarter .calc-display {
          height: 46px;
          font-size: 22px;
          padding: 6px;
        }

        .length-panel .calculator.full .calc-display {
          height: 75px;
          font-size: 38px;
          padding: 12px;
        }

        .length-panel .calc-display {
          background: #d7e0c5;
          text-align: right;
          font-family: monospace;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease-in-out;
          border: none;
          outline: none;
        }

        .length-panel .calc-display:hover, .length-panel .calc-display:focus {
          background: #c9d4b3;
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.15);
        }

        .length-panel .memory {
          color: white;
          font-size: 12px;
          text-align: right;
          margin: 6px 0 12px 0;
        }

        .length-panel .calc-buttons {
          display: grid;
          gap: 6px;
          width: 100%;
        }

        .length-panel .calculator.full .calc-buttons {
          gap: 10px;
        }

        .length-panel .calc-buttons.two-col {
          grid-template-columns: repeat(2, 1fr) !important;
        }

        .length-panel .calc-buttons.four-col {
          grid-template-columns: repeat(4, 1fr) !important;
        }

        .length-panel .calculator.quarter .calc-buttons button {
          height: 36px;
          font-size: 13px;
        }

        .length-panel .calculator.full .calc-buttons button {
          height: 56px;
          font-size: 20px;
          border-radius: 8px;
        }

        .length-panel .calc-buttons button {
          background: #111827;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
        }

        .length-panel .red {
          background: #b91c1c !important;
        }

        @media (max-width: 600px) {
          .length-panel.quarter {
            width: 25vw;
          }
        }
      `}</style>
    </>
  );
}

export default LengthConversion;