import React, { useState, useEffect } from "react";

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

  // FORCE 1/4 SCREEN ON FIRST LOAD
  useEffect(() => {
    setPanel("quarter");
  }, []);

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

    // Map your sequential operators safely back to display engines
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
      {/* OPEN BUTTON */}
      {panel === "hidden" && (
        <button className="open-arrow" onClick={() => setPanel("quarter")}>
          ▶
        </button>
      )}

      {/* PANEL */}
      {panel !== "hidden" && (
        <div className={`length-panel ${panel}`}>

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
            <div className="converterCard">
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
              <div className="calculator">

                <div className="calc-display">
                  {calc || "0"}
                </div>

                <div className="memory">M: {memory}</div>

                <div className={`calc-buttons ${panel === "quarter" ? "two-col" : "four-col"}`}>
                  {currentButtons.map((btn) => {
                    // Visual fallback for your specific array layout mapping definitions
                    let displayLabel = btn;
                    if (btn === "*") displayLabel = "×";
                    if (btn === "/") displayLabel = "÷";

                    // Determine grid-spanning behavior dynamically
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
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .length-panel {
          position: fixed;
          right: 0;
          top: 70px;
          height: calc(100vh - 70px);
          width: 25vw;
          background: #ffffff;
          z-index: 9999;
          box-shadow: -5px 0 20px rgba(0,0,0,.25);
          overflow-y: auto;
          overflow-x: hidden;
          transition: 0.3s ease;
        }

        .length-panel.quarter {
          width: 25vw;
        }

        .length-panel.full {
          width: 100vw;
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

        .open-arrow {
          position: fixed;
          right: 0;
          top: 50%;
          width: 50px;
          height: 70px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px 0 0 10px;
          font-size: 20px;
          cursor: pointer;
        }

        .content {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ===== CONVERTER UI ===== */
        .converterCard {
          background: #f8fafc;
          padding: 10px;
          border-radius: 14px;
          box-shadow: inset 0 0 0 1px #e2e8f0;
          width: 100%;
          box-sizing: border-box;
        }

        .converterRow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-sizing: border-box;
        }

        input, select {
          width: 100%;
          padding: 6px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
          box-sizing: border-box;
        }

        .swapBtn {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: none;
          background: #2563eb;
          color: white;
          font-size: 16px;
          transform: rotate(90deg);
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
          max-width: 260px;
          background: #292929;
          padding: 12px;
          border-radius: 12px;
        }

        .calc-display {
          background: #d7e0c5;
          height: 50px;
          font-size: 24px;
          text-align: right;
          padding: 6px;
          font-family: monospace;
          overflow-x: auto;
        }

        .memory {
          color: white;
          font-size: 12px;
          text-align: right;
          margin: 6px 0;
        }

        .calc-buttons {
          display: grid;
          gap: 6px;
        }

        .calc-buttons.two-col {
          grid-template-columns: repeat(2, 1fr);
        }

        .calc-buttons.four-col {
          grid-template-columns: repeat(4, 1fr);
        }

        .calc-buttons button {
          height: 38px;
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
          input, select {
            font-size: 10px;
            padding: 4px;
          }
        }
      `}</style>
    </>
  );
}

export default LengthConversion;