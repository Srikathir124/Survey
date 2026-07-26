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

  const handlePhysicalType = (val) => {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setValue1(val);
    setValue2(convert(val, unit1, unit2));
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
          <div className="unit-group">
            <input
              type="number" inputMode="numeric" pattern="[0-9]*"
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

          <button className="swap" onClick={swapUnits} title="Swap Units">
            ⇄
          </button>

          <div className="unit-group">
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

          .red-label-output {
            width: 100%;
            padding: 10px 12px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 6px;
            color: #dc2626;
            box-sizing: border-box;
            height: 40px;
            display: flex;
            align-items: center;
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
          }
        `}</style>
      </div>
    </div>
  );
}

export default AreaConversion;