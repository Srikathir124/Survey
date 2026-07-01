import React, { useState } from "react";

function AreaConversion() {
  const units = [
    "square meter",
    "square foot",
    "Acre",
    "Cent",
    "Ground",
    "Ares",
    "Hectare"
  ];

  const factors = {
    "square meter": 1,
    "square foot": 0.092903,
    "Acre": 4046.8564224,
    "Cent": 40.468564224,
    "Ground": 222.967296,
    "Ares": 100,
    "Hectare": 10000
  };

  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [unit1, setUnit1] = useState("square meter");
  const [unit2, setUnit2] = useState("Ground");

  function convert(value, from, to) {
    if (value === "") return "";
    let baseValue = Number(value) * factors[from];
    return (baseValue / factors[to]).toFixed(4);
  }

  // Handle standard typing (Desktop Mode) for the first input box only
  const handlePhysicalType = (val) => {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setValue1(val);
    setValue2(convert(val, unit1, unit2));
  };

  // Handle touch buttons typing (Mobile Mode) targeting input1 exclusively
  const handleKeypadInput = (key) => {
    let current = value1;

    if (key === "⌫") {
      current = current.slice(0, -1);
    } else if (key === ".") {
      if (current.includes(".")) return;
      current = current === "" ? "0." : current + ".";
    } else {
      current = current + key;
    }

    setValue1(current);
    setValue2(convert(current, unit1, unit2));
  };

  function firstUnitChange(e) {
    let newUnit = e.target.value;
    setUnit1(newUnit);
    setValue2(convert(value1, newUnit, unit2));
  }

  function secondUnitChange(e) {
    let newUnit = e.target.value;
    setUnit2(newUnit);
    setValue2(convert(value1, unit1, newUnit));
  }

  function swapUnits() {
    const tempUnit = unit1;
    setUnit1(unit2);
    setUnit2(tempUnit);
    
    // Setting value2 to value1 since it's now our main driver
    setValue1(value2);
    setValue2(convert(value2, unit2, tempUnit));
  }

  return (
    <div className="area-page">
      <div className="area-card">
        <div className="area-header">
          <h2>📐 Area Conversion</h2>
        </div>

        <div className="converter-box">
          {/* FROM SECTION (First Box - Active Input) */}
          <div className="unit-group active">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter area"
              value={value1}
              onChange={(e) => handlePhysicalType(e.target.value)}
              className="touch-conditional-input"
            />
            <select value={unit1} onChange={firstUnitChange}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* SWAP TOGGLE */}
          <button className="swap" onClick={swapUnits} title="Swap Units">
            ⇄
          </button>

          {/* TO SECTION (Second Box - Red Label Field) */}
          <div className="unit-group-output">
            <div className="red-label-output">
              {value2 !== "" ? value2 : <span className="label-placeholder">Result</span>}
            </div>
            <select value={unit2} onChange={secondUnitChange}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= VIRTUAL KEYPAD ================= */}
        <div className="virtual-keypad">
          {[
            "7", "8", "9",
            "4", "5", "6",
            "1", "2", "3",
            ".", "0", "⌫"
          ].map((key) => (
            <button 
              key={key} 
              onMouseDown={(e) => {
                e.preventDefault(); 
                handleKeypadInput(key);
              }}
              className={key === "⌫" ? "backspace-key" : ""}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .area-page {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f3f6fb;
          padding: 12px;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .area-card {
          background: white;
          width: 100%;
          max-width: 550px;
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,.06);
          box-sizing: border-box;
        }

        .area-header {
          text-align: center;
          margin-bottom: 16px;
        }

        h2 {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
          font-weight: 600;
        }

        .converter-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .unit-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          box-sizing: border-box;
          background: #f8fafc;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .unit-group.active {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #2563eb;
          background: #ffffff;
        }

        /* Red Label Component Styling Container */
        .unit-group-output {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          box-sizing: border-box;
          background: #fff5f5;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #fee2e2;
        }

        .red-label-output {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #fca5a5;
          background: #ffebeb;
          color: #dc2626;
          box-sizing: border-box;
          height: 40px;
          display: flex;
          align-items: center;
        }

        .label-placeholder {
          color: #f87171;
          font-weight: 400;
        }

        input, select {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          outline: none;
          background: #ffffff;
          box-sizing: border-box;
          height: 40px;
        }

        input:focus, select:focus {
          border-color: #2563eb;
        }

        .swap {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: #2563eb;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transform: rotate(90deg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
        }

        /* ===== RESPONSIVE KEYPAD BEHAVIORS ===== */
        .virtual-keypad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #f1f5f9;
          padding: 12px;
          border-radius: 12px;
          width: 100%;
          box-sizing: border-box;
          margin-top: 16px;
        }

        /* Default mobile touch behaviors for first input only */
        @media (pointer: coarse) {
          .touch-conditional-input {
            pointer-events: none; 
          }
        }

        /* ===== COARSE POINTER MEDIA QUERY (DESKTOP CONTROLS) ===== */
        @media (pointer: fine), (min-width: 550px) {
          .converter-box {
            flex-direction: row;
            align-items: center;
            gap: 14px;
          }

          .unit-group, .unit-group-output {
            flex: 1;
          }

          .swap {
            transform: rotate(0deg);
          }

          .virtual-keypad {
            display: none !important;
          }

          .touch-conditional-input {
            pointer-events: auto !important;
          }
        }

        .virtual-keypad button {
          height: 48px;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .virtual-keypad button:active {
          background: #e2e8f0;
        }

        .virtual-keypad .backspace-key {
          color: #ef4444;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}

export default AreaConversion;