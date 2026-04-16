import React, { useState, useRef } from "react";

export default function OffsetIntersectionUI() {
  const [C1, setC1] = useState("");
  const [C2, setC2] = useState("");
  const [O1, setO1] = useState("");
  const [O2, setO2] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // 🔁 Refs for auto focus
  const refC1 = useRef();
  const refO1 = useRef();
  const refC2 = useRef();
  const refO2 = useRef();

  const Y = { x: 300, y: 480 };
  const Z = { x: 300, y: 180 };
  const P1 = { x: 160, y: 480 };
  const P2 = { x: 440, y: 180 };

  // ✅ Strict numeric input
  const handleNumberInput = (setter) => (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setter(val);
      setError("");
    }
  };

  // ⏎ Enter navigation
  const handleKey = (nextRef) => (e) => {
    if (e.key === "Enter" && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleCalculate = () => {
    if (!C1 || !C2 || !O1 || !O2) {
      setError("Enter all values");
      return;
    }

    const c1 = Number(C1);
    const c2 = Number(C2);
    const o1 = -Math.abs(Number(O1));
    const o2 = Math.abs(Number(O2));

    const yz = c2 - c1;
    const r = o1 / (o1 - o2);

    const d12 = Math.sqrt((o2 - o1) ** 2 + yz ** 2);
    const d1x = Math.abs(r * d12);
    const d2x = Math.abs((1 - r) * d12);
    const yx = Math.abs(r * yz);
    const xz = Math.abs((1 - r) * yz);

    const X = {
      x: 300, // fixed on AB line
      y:
        P1.y +
        ((300 - P1.x) * (P2.y - P1.y)) /
          (P2.x - P1.x),
    };

    setResult({
      X,
      d12: d12.toFixed(2),
      d1x: d1x.toFixed(2),
      d2x: d2x.toFixed(2),
      yx: yx.toFixed(2),
      xz: xz.toFixed(2),
    });

    setError("");
  };

  const mid = (A, B) => ({
    x: (A.x + B.x) / 2,
    y: (A.y + B.y) / 2,
  });

  const angle =
    (Math.atan2(P2.y - P1.y, P2.x - P1.x) * 180) / Math.PI;

  const offsetBelow = (A, B, d = 18) => {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    return {
      x: (dy / len) * d,
      y: (-dx / len) * d,
    };
  };

  const axisOffsetX = 280;

  const inputStyle = {
    width: "70px",
    padding: "2px",
    fontSize: "12px",
    border: "1px solid #888",
    borderRadius: "4px",
    outline: "none"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="700" height="700">

        {/* Axis */}
        <line x1="300" y1="50" x2="300" y2="650"
          stroke="black"
          strokeDasharray="10,6,2,4,2,4,2,6"
        />

        {/* Labels */}
        <text x="310" y="660">A</text>
        <text x="310" y={Y.y}>Y</text>
        <text x="270" y={Z.y}>Z</text>
        <text x="310" y="40">B</text>

        {/* Offsets */}
        <line x1="300" y1={Y.y} x2={P1.x} y2={P1.y} stroke="black" strokeDasharray="5,5"/>
        <line x1="300" y1={Z.y} x2={P2.x} y2={P2.y} stroke="black" strokeDasharray="5,5"/>

        {/* Points */}
        <circle cx={P1.x} cy={P1.y} r="5"/>
        <text x={P1.x - 15} y={P1.y - 10}>1</text>

        <circle cx={P2.x} cy={P2.y} r="5"/>
        <text x={P2.x + 5} y={P2.y - 10}>2</text>

        {/* Line 1 to 2*/}
        <line
          x1={P1.x}
          y1={P1.y}
          x2={P2.x}
          y2={P2.y}
          stroke="black"
          strokeWidth="1.5"
        />

        {/* 🔴 X FIXED LABEL OFFSET */}
        {result && (
          <>
            <circle cx={result.X.x} cy={result.X.y} r="6" fill="red"/>
         </>
        )}

        {/* Values (unchanged) */}
        {result && (
          <>
            <text x={axisOffsetX}
              y={mid(Y, result.X).y}
              fill="red"
              transform={`rotate(-90 ${axisOffsetX} ${mid(Y, result.X).y})`}>
              {result.yx}
            </text>

            <text x={axisOffsetX}
              y={mid(result.X, Z).y}
              fill="red"
              transform={`rotate(-90 ${axisOffsetX} ${mid(result.X, Z).y})`}>
              {result.xz}
            </text>

            {(() => {
              const m = mid(P1, result.X);
              const o = offsetBelow(P1, result.X);
              return (
                <text x={m.x + o.x} y={m.y + o.y}
                  fill="red"
                  transform={`rotate(${angle} ${m.x} ${m.y})`}>
                  {result.d1x}
                </text>
              );
            })()}

            {(() => {
              const m = mid(result.X, P2);
              const o = offsetBelow(result.X, P2);
              return (
                <text x={m.x + o.x} y={m.y + o.y}
                  fill="red"
                  transform={`rotate(${angle} ${m.x} ${m.y})`}>
                  {result.d2x}
                </text>
              );
            })()}

            {(() => {
              const m = mid(P1, P2);
              const o = offsetBelow(P1, P2, 25);
              return (
                <text x={m.x + o.x} y={m.y + o.y}
                  fill="red"
                  transform={`rotate(${angle} ${m.x} ${m.y})`}>
                  ({result.d12})
                </text>
              );
            })()}
          </>
        )}

        {/* Inputs with professional behavior */}
        <foreignObject x="340" y={Y.y - 15} width="80" height="30">
          <input ref={refC1}
            value={C1}
            onChange={handleNumberInput(setC1)}
            onKeyDown={handleKey(refO1)}
            placeholder="A to Y"
            style={inputStyle}
          />
        </foreignObject>

        <foreignObject x="200" y={Y.y + 20} width="70" height="30">
          <input ref={refO1}
            value={O1}
            onChange={handleNumberInput(setO1)}
            onKeyDown={handleKey(refC2)}
            placeholder="1 to Y"
            style={inputStyle}
          />
        </foreignObject>

        <foreignObject x="190" y={Z.y - 15} width="80" height="30">
          <input ref={refC2}
            value={C2}
            onChange={handleNumberInput(setC2)}
            onKeyDown={handleKey(refO2)}
            placeholder="A to Z"
            style={inputStyle}
          />
        </foreignObject>

        <foreignObject x="360" y={Z.y - 50} width="70" height="30">
          <input ref={refO2}
            value={O2}
            onChange={handleNumberInput(setO2)}
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            placeholder="2 to Z"
            style={inputStyle}
          />
        </foreignObject>

      </svg>

      {/* Error */}
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      <button onClick={handleCalculate}
        style={{
          marginTop: 15,
          padding: "10px 30px",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(135deg, #36d1dc, #5b86e5)",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}>
        Calculate
      </button>
    </div>
  );
}