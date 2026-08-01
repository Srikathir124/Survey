import React, { useState } from "react";
import Calculator from "./calculator";

function LengthConversion() {
  const units = ["meter", "foot", "inch", "link"];

  const factors = {
    meter: 1,
    foot: 0.3048,
    inch: 0.0254,
    link: 0.2, // 1 link = 0.2 meter
  };

  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [unit1, setUnit1] = useState("meter");
  const [unit2, setUnit2] = useState("foot");

  const [panel, setPanel] = useState("quarter");

  // ---------------- CONVERTER ----------------

  function convert(value, from, to) {
    if (value === "") return "";
    const computed = (Number(value) * factors[from]) / factors[to];
    if (!isFinite(computed) || Math.abs(computed) > 99999999999999999999) return "Value Too Large";
    return computed.toFixed(4);
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

  return (
    <>
      {/* OPEN BUTTON */}
      {panel === "hidden" && (
        <button
          className="calculator-open-arrow"
          onClick={() => setPanel("quarter")}
          aria-label="Open calculator"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <rect x="7" y="5" width="10" height="4" rx="1" />
            <path d="M7 11h2M11 11h2M15 11h2M7 15h2M11 15h2M15 15h2M7 19h2M11 19h2M15 19h2" />
          </svg>
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

                  <div className="box">
                    <input
                      className="result-input"
                      value={value2}
                      readOnly
                      placeholder="Result"
                    />
                    <select value={unit2} onChange={changeTo}>
                      {units.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ================= CALCULATOR COMPONENT ================= */}
              <Calculator panel={panel} />
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

        /* Result input: no border, red, big, bold */
        .length-panel .result-input {
          border: none !important;
          color: #dc2626 !important;
          font-size: 20px !important;
          font-weight: 800 !important;
          background: transparent !important;
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