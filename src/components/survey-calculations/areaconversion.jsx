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

  // Base unit = Square Meter
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

  function firstChange(e) {
    let val = e.target.value;
    setValue1(val);
    setValue2(convert(val, unit1, unit2));
  }

  function secondChange(e) {
    let val = e.target.value;
    setValue2(val);
    setValue1(convert(val, unit2, unit1));
  }

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

  // Unified event for swap unit transformations
  function swapUnits() {
    setUnit1(unit2);
    setUnit2(unit1);
    setValue1(value2);
    setValue2(value1);
  }

  return (
    <div className="area-page">
      <div className="area-card">
        <div className="area-header">
          <h2>📐 Area Conversion</h2>
          <p className="subtitle">Land measurement converter</p>
        </div>

        <div className="converter-box">
          {/* FROM SECTION */}
          <div className="unit-group">
            <input
              type="number"
              placeholder="Enter area"
              value={value1}
              onChange={firstChange}
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

          {/* TO SECTION */}
          <div className="unit-group">
            <input
              className="result"
              value={value2}
              readOnly
              placeholder="Result"
            />
            <select value={unit2} onChange={secondUnitChange}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <style>{`
        .area-page {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f3f6fb;
          padding: 12px;
          box-sizing: border-box;
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

        .subtitle {
          color: #6b7280;
          margin: 4px 0 0 0;
          font-size: 12px;
        }

        .converter-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        /* Group cards that layout dropdowns vertically below the inputs */
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
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .result {
          background: #f1f5f9;
          font-weight: 600;
          color: #1e293b;
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
          transform: rotate(90deg); /* Vertical indicator arrow configuration for mobile stacks */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
          transition: background 0.2s;
        }

        .swap:hover {
          background: #1d4ed8;
        }

        /* ================= DESKTOP SIDE-BY-SIDE VIEW OVERRIDES ================= */
        @media(min-width: 550px) {
          .converter-box {
            flex-direction: row;
            align-items: center;
            gap: 14px;
          }

          .unit-group {
            flex: 1;
          }

          .swap {
            transform: rotate(0deg); /* Flips naturally horizontal for wide screen desktop displays */
          }
        }
      `}</style>
    </div>
  );
}

export default AreaConversion;