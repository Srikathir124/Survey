import React, { useState, useEffect, useRef } from "react";

function Calculator({ panel = "quarter" }) {
  const [calc, setCalc] = useState("");
  const [memory, setMemory] = useState(0);

  // Ref to target the display element for auto-scrolling
  const displayRef = useRef(null);

  // Robust auto-scroll hook that handles web/desktop containers cleanly
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [calc]);

  // ---------------- CASIO ENGINE ----------------

  function formatExpression(expr) {
    return expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√/g, "Math.sqrt");
  }

  function evaluate(expr) {
    try {
      if (expr === "Error" || expr === "Overflow" || !expr) return expr || "0";

      let sanitized = expr;
      const openCount = (sanitized.match(/\(/g) || []).length;
      const closeCount = (sanitized.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        sanitized += ")".repeat(openCount - closeCount);
      }

      const formatted = formatExpression(sanitized);
      const result = Function(`"use strict"; return (${formatted})`)();

      if (result === undefined || isNaN(result)) return "Error";

      if (!isFinite(result) || Math.abs(result) > 99999999999999999999) {
        return "Value Too Large";
      }

      // Strip out floating point noise (e.g. 0.1 + 0.2 = 0.30000000004) up to 10 decimal places
      return Number(Math.round(result + "e10") + "e-10");
    } catch {
      return "Error";
    }
  }

  function isOperator(c) {
    return ["+", "-", "*", "/", "×", "÷"].includes(c);
  }

  function calculate(btn) {
    if (btn === "AC") return setCalc("");

    // If display is currently showing an error status, clear it upon next interaction
    if (calc === "Error" || calc === "Overflow") {
      if (["M+", "M-", "MC", "=", "⌫"].includes(btn) || isOperator(btn)) {
        return; // Ignore operations on broken state until wiped
      }
      if (btn === ".") {
        setCalc("0.");
        return;
      }
      setCalc(btn);
      return;
    }

    if (btn === "MC") return setMemory(0);
    if (btn === "M+") return setMemory((m) => m + Number(evaluate(calc) || 0));
    if (btn === "M-") return setMemory((m) => m - Number(evaluate(calc) || 0));

    if (btn === "⌫") {
      setCalc((prev) => prev.slice(0, -1));
      return;
    }

    if (btn === "√") {
      setCalc((prev) => prev + "√(");
      return;
    }

    if (btn === "=") {
      setCalc(String(evaluate(calc)));
      return;
    }

    const parsedBtn = btn === "*" ? "×" : btn === "/" ? "÷" : btn;

    if (parsedBtn === ".") {
      const lastNumberChunk = calc.split(/[\+\-\*\/×÷\(\)]/).pop();
      if (lastNumberChunk.includes(".")) return;
    }

    setCalc((prev) => {
      if (isOperator(parsedBtn) && prev.length > 0) {
        const lastChar = prev.slice(-1);
        if (isOperator(lastChar)) {
          return prev.slice(0, -1) + parsedBtn;
        }
      }
      return prev + parsedBtn;
    });
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
    <div className="calculator-wrapper">
      <div className={`calculator ${panel}`}>
        <div className="calc-display-wrapper">
          <div
            ref={displayRef}
            className="calc-display"
          >
            {calc || "0"}
          </div>
        </div>

        <div className="memory">M: {memory}</div>

        <div className={`calc-buttons ${panel === "quarter" ? "two-col" : "four-col"}`}>
          {currentButtons.map((btn) => {
            let displayLabel = btn;
            if (btn === "*") displayLabel = "×";
            if (btn === "/") displayLabel = "÷";
            if (btn === ".") {
              displayLabel = <span className="big-dot">•</span>;
            }

            // Dynamic alignment logic for grid rules
            let dynamicStyle = {};
            if (panel === "quarter" && btn === "=") {
              dynamicStyle = { gridColumn: "span 2" };
            } else if (panel !== "quarter" && (btn === "0" || btn === "=")) {
              dynamicStyle = { gridColumn: "span 2" };
            }

            // Check if the current button is one of the target math operators
            const isMathOperator = ["+", "-", "*", "/", "×", "÷"].includes(btn);
            let buttonClass = btn === "AC" ? "red" : "";
            if (isMathOperator) {
              buttonClass += " btn-operator";
            }

            return (
              <button
                key={btn}
                onClick={() => calculate(btn)}
                className={buttonClass.trim()}
                style={dynamicStyle}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </div>
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


        .length-panel .calc-display-wrapper {
          width: 100%;
          background: #d7e0c5;
          border-radius: 4px;
          overflow: hidden;
          box-sizing: border-box;
        }


        .length-panel .calculator.quarter .calc-display {
          height: 46px;
          font-size: 22px;
          line-height: 46px;
        }


        .length-panel .calculator.full .calc-display {
          height: 75px;
          font-size: 38px;
          line-height: 75px;
        }


        .length-panel .calc-display {
          font-family: monospace;
          width: 100%;
          box-sizing: border-box;
          transition: background 0.2s ease-in-out;
          padding: 0 12px;
          text-align: right;            
          overflow-x: auto;            
          overflow-y: hidden;          
          white-space: nowrap;          
          -webkit-overflow-scrolling: touch;
        }


        .length-panel .calc-display::-webkit-scrollbar {
          display: none;
        }
        .length-panel .calc-display {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }


        .length-panel .calc-display-wrapper:hover .calc-display {
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
          touch-action: manipulation;
        }


        .length-panel .calculator.full .calc-buttons button {
          height: 56px;
          font-size: 20px;
          border-radius: 8px;
          touch-action: manipulation;
        }


        .length-panel .calc-buttons button {
          background: #111827;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
        }


        /* Operator-specific style override (Bigger font, orange background) */
        .length-panel .btn-operator {
          background-color: #f97316 !important; /* Bold accessible orange */
          font-weight: bold !important;
        }


        .length-panel .calculator.quarter .btn-operator {
          font-size: 1.0rem !important;
        }


        .length-panel .calculator.full .btn-operator {
          font-size: 1.8rem !important;
        }


        .length-panel .big-dot {
          font-size: 1.5rem;
          line-height: 1;
          display: inline-block;
          transform: translateY(-2px);
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
    </div>
  );
}

export default Calculator;