import React, { useState } from "react";

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

  // Initialized to completely hidden on mount
  const [panel, setPanel] = useState("hidden");

  const [calc, setCalc] = useState("");
  const [memory, setMemory] = useState(0);

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
      .replace(/%/g, "/100")
      .replace(/√/g, "Math.sqrt");
  }

  function evaluate(expr) {
    try {
      const formatted = formatExpression(expr);
      return Function(`"use strict"; return (${formatted})`)();
    } catch {
      return "Error";
    }
  }

  function isOperator(c) {
    return ["+", "-", "*", "/"].includes(c);
  }

  function calculate(btn) {
    if (btn === "AC") return setCalc("");

    if (btn === "MC") return setMemory(0);
    if (btn === "M+") return setMemory((m) => m + Number(calc || 0));
    if (btn === "M-") return setMemory((m) => m - Number(calc || 0));

    if (btn === "√") {
      setCalc((p) => `√(${p || "0"})`);
      return;
    }

    if (btn === "=") {
      setCalc(String(evaluate(calc)));
      return;
    }

    const parsedBtn = btn === "*" ? "×" : btn === "/" ? "÷" : btn;

    setCalc((prev) => {
      const last = prev.slice(-1);

      if (isOperator(last) && isOperator(parsedBtn)) {
        return prev.slice(0, -1) + parsedBtn;
      }

      return prev + parsedBtn;
    });
  }

  // ---------------- LAYOUT ARRAYS ----------------

  const traditionalLayout = [
    "MC", "M-", "M+", "√",
    "AC", "%", "÷", "×",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", ".",
    "0", "="
  ];

  const quarterLayout = [
    "MC", "M-",
    "M+", "√",
    "AC", ".",
    "8", "9",
    "6", "7",
    "4", "5",
    "2", "3",
    "1", "0",
    "+", "-",
    "*", "/",
    "=",
  ];

  const currentButtons = panel === "quarter" ? quarterLayout : traditionalLayout;

  // ---------------- UI ----------------

  return (
    <>
      {/* OPEN BUTTON - Completely detached with max override layer stacking */}
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
              <div className="calculator-wrapper">
                <div className={`calculator ${panel}`}>
                  <div className="calc-display">{calc || "0"}</div>

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
          z-index: 99999; /* Higher baseline index layers */
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

        .toolbar {
          display: flex;
          gap: 4px;
          padding: 6px;
          background: #f1f5f9;
        }

        .toolbar button {
          flex: 1;
          height: 36px;
          border: none;
          background: #2563eb;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        /* HARD OVERRIDE FOR OPEN BUTTON LAYER BLOCKING INTRUSIONS */
        .calculator-open-arrow {
          position: fixed !important;
          right: 0 !important;
          top: 50% !important;
          width: 50px !important;
          height: 70px !important;
          background: #2563eb !important;
          color: white !important;
          border: 2px solid #ffffff !important; /* Contrasting stroke line */
          border-right: none !important;
          border-radius: 10px 0 0 10px !important;
          font-size: 20px !important;
          cursor: pointer !important;
          z-index: 2147483647 !important; /* Max mathematical value override layer */
          display: block !important;
          box-shadow: -2px 2px 10px rgba(0,0,0,0.3) !important;
        }

        .content {
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ===== CONVERTER UI ===== */
        .converterCard {
          background: #f8fafc;
          padding: 12px;
          border-radius: 14px;
          box-shadow: inset 0 0 0 1px #e2e8f0;
          width: 100%;
          box-sizing: border-box;
        }

        .converterCard.full {
          padding: 24px;
        }

        .converterCard.quarter .converterRow {
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .converterCard.full .converterRow {
          flex-direction: row;
          align-items: center;
          gap: 16px;
        }

        .box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
        }

        .converterCard.quarter input, .converterCard.quarter select {
          padding: 6px;
          font-size: 13px;
        }

        .converterCard.full input, .converterCard.full select {
          padding: 14px;
          font-size: 18px;
          border-radius: 10px;
        }

        input, select {
          width: 100%;
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
        }

        .converterCard.quarter .swapBtn {
          width: 36px;
          height: 36px;
          font-size: 16px;
          transform: rotate(90deg);
        }

        .converterCard.full .swapBtn {
          width: 54px;
          height: 54px;
          font-size: 24px;
          transform: rotate(0deg);
          flex-shrink: 0;
        }

        .swapBtn {
          border-radius: 12px;
          border: none;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        /* ===== CALCULATOR STYLES ===== */
        .calculator-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }

        .calculator {
          width: 100%;
          background: #292929;
          border-radius: 12px;
          box-sizing: border-box;
          transition: max-width 0.3s ease;
        }

        .calculator.quarter {
          max-width: 260px;
          padding: 12px;
        }

        .calculator.full {
          max-width: 600px;
          padding: 24px;
        }

        .calculator.quarter .calc-display {
          height: 50px;
          font-size: 24px;
          padding: 6px;
        }

        .calculator.full .calc-display {
          height: 75px;
          font-size: 38px;
          padding: 12px;
        }

        .calc-display {
          background: #d7e0c5;
          text-align: right;
          font-family: monospace;
          overflow-x: auto;
        }

        .memory {
          color: white;
          font-size: 12px;
          text-align: right;
          margin: 6px 0 12px 0;
        }

        .calc-buttons {
          display: grid;
          gap: 6px;
        }

        .calculator.full .calc-buttons {
          gap: 10px;
        }

        .calc-buttons.two-col {
          grid-template-columns: repeat(2, 1fr);
        }

        .calc-buttons.four-col {
          grid-template-columns: repeat(4, 1fr);
        }

        .calculator.quarter .calc-buttons button {
          height: 38px;
          font-size: 14px;
        }

        .calculator.full .calc-buttons button {
          height: 56px;
          font-size: 20px;
          border-radius: 8px;
        }

        .calc-buttons button {
          background: #111827;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .red {
          background: #b91c1c !important;
        }

        @media (max-width: 600px) {
          .length-panel.quarter {
            width: 25vw;
          }
          .converterCard.quarter input, .converterCard.quarter select {
            font-size: 10px;
            padding: 4px;
          }
        }
      `}</style>
    </>
  );
}

export default LengthConversion;