import React, { useState } from "react";
import { trackEvent } from "../../utils/analytics.js";

// Canvas coordinate space
const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 380;

function Nos() {
  // Triangle Vertices (Shifted up slightly so AC at y=270 has plenty of margin)
  const A = { x: 70, y: 270 };
  const C = { x: 330, y: 270 };
  const B = { x: 200, y: 50 };

  const D = {
    x: (A.x + C.x) / 2,
    y: (A.y + C.y) / 2,
  };

  const midAB = {
    x: (A.x + B.x) / 2,
    y: (A.y + B.y) / 2,
  };

  const midBC = {
    x: (B.x + C.x) / 2,
    y: (B.y + C.y) / 2,
  };

  const centroid = {
    x: (A.x + B.x + C.x) / 3,
    y: (A.y + B.y + C.y) / 3,
  };

  const getAngle = (p1, p2) => {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  };

  const getOffsetPoint = (p1, p2, mid, distance = 26) => {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    let nx = -dy;
    let ny = dx;

    const length = Math.sqrt(nx * nx + ny * ny);
    nx /= length;
    ny /= length;

    const toCentroidX = centroid.x - mid.x;
    const toCentroidY = centroid.y - mid.y;

    if (nx * toCentroidX + ny * toCentroidY > 0) {
      nx = -nx;
      ny = -ny;
    }

    return {
      x: mid.x + nx * distance,
      y: mid.y + ny * distance,
    };
  };

  const angleAB = getAngle(A, B);
  const angleBC = getAngle(B, C);
  const angleBD = getAngle(B, D);

  const posAB = getOffsetPoint(A, B, midAB);
  const posBC = getOffsetPoint(B, C, midBC);

  const [values, setValues] = useState({
    AB: "",
    BC: "",
    AC: "",
  });

  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (key, val) => {
    setValues({ ...values, [key]: val });
    setErrors({ ...errors, [key]: false });
    setErrorMsg("");
  };

  const handleCalculate = () => {
    let newErrors = {};
    let missing = [];

    ["AB", "BC", "AC"].forEach((key) => {
      if (!values[key] || Number(values[key]) <= 0) {
        newErrors[key] = true;
        missing.push(key);
      }
    });

    setErrors(newErrors);

    if (missing.length > 0) {
      setErrorMsg(`${missing.join(", ")} missing or invalid`);
      setResult(null);
      return;
    }

    const AB = parseFloat(values.AB);
    const BC = parseFloat(values.BC);
    const AC = parseFloat(values.AC);

    const AD = (AB * AB + AC * AC - BC * BC) / (2 * AC);
    const CD = (BC * BC + AC * AC - AB * AB) / (2 * AC);
    const heightSquared = AB * AB - AD * AD;

    if (heightSquared <= 0) {
      setErrorMsg("The entered sides cannot form a valid triangle.");
      setResult(null);
      return;
    }

    const BD = Math.sqrt(heightSquared);

    setResult({
      AD: AD.toFixed(2),
      CD: CD.toFixed(2),
      BD: BD.toFixed(2),
    });

    setErrorMsg("");

    trackEvent("calculator_used", {
      calculator_name: "NOS Calculator",
    });
  };

  // Helper for responsive percentage-based input positioning
  const getInputPosition = (pos, angle, error) => ({
    ...styles.input,
    top: `${(pos.y / VIEW_HEIGHT) * 100}%`,
    left: `${(pos.x / VIEW_WIDTH) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
    border: error ? "2px solid red" : "1px solid #ccc",
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>NOS Calculator</h1>

      <div style={styles.canvasWrapper}>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          style={styles.svg}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Main Triangle */}
          <polygon
            points={`${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`}
            style={styles.triangle}
          />

          {/* Perpendicular / Offset line (B to D) */}
          <line
            x1={B.x}
            y1={B.y}
            x2={D.x}
            y2={D.y}
            style={styles.dashedLine}
          />

          {/* D Point Indicator */}
          <circle cx={D.x} cy={D.y} r="4" fill="#111" />
          <text x={D.x + 8} y={D.y - 8} style={styles.vertexLabel}>
            D
          </text>

          {/* Corner Labels */}
          <text x={A.x - 18} y={A.y + 10} style={styles.vertexLabel}>
            A
          </text>
          <text x={C.x + 8} y={C.y + 10} style={styles.vertexLabel}>
            C
          </text>
          <text x={B.x} y={B.y - 12} style={styles.vertexLabel} textAnchor="middle">
            B
          </text>

          {/* Results Displayed Inside Diagram */}
          {result && (
            <>
              {/* AD Value */}
              <text
                x={(A.x + D.x) / 2}
                y={A.y - 10}
                style={styles.resultValue}
              >
                {result.AD}
              </text>

              {/* CD Value */}
              <text
                x={(D.x + C.x) / 2}
                y={C.y - 10}
                style={styles.resultValue}
              >
                {result.CD}
              </text>

              {/* BD Height Value */}
              <text
                x={(B.x + D.x) / 2 - 16}
                y={(B.y + D.y) / 2}
                style={styles.resultValue}
                transform={`rotate(${angleBD}, ${(B.x + D.x) / 2 - 16}, ${(B.y + D.y) / 2})`}
              >
                {result.BD}
              </text>
            </>
          )}
        </svg>

        {/* Floating Input Boxes */}
        <input
          type="number"
          placeholder="AB"
          value={values.AB}
          onChange={(e) => handleChange("AB", e.target.value)}
          style={getInputPosition(posAB, angleAB, errors.AB)}
        />

        <input
          type="number"
          placeholder="BC"
          value={values.BC}
          onChange={(e) => handleChange("BC", e.target.value)}
          style={getInputPosition(posBC, angleBC, errors.BC)}
        />

        <input
          type="number"
          placeholder="AC"
          value={values.AC}
          onChange={(e) => handleChange("AC", e.target.value)}
          style={getInputPosition({ x: D.x, y: D.y + 24 }, 0, errors.AC)}
        />
      </div>

      {/* Error Message */}
      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      {/* Action Button */}
      <button onClick={handleCalculate} style={styles.button}>
        Calculate
      </button>

      {/* Result Card */}
      {result && (
        <div style={styles.resultCard}>
          <div><b>AD:</b> {result.AD} m</div>
          <div><b>CD:</b> {result.CD} m</div>
          <div><b>BD (Height):</b> {result.BD} m</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "20px",
    padding: "0 10px 40px 10px",
    fontFamily: "Arial, sans-serif",
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "15px",
    color: "#1f2937",
    fontSize: "1.5rem",
  },
  canvasWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "380px",
    aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}`,
    margin: "0 auto 10px auto",
  },
  svg: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  triangle: {
    fill: "#f8fafc",
    stroke: "#1e293b",
    strokeWidth: 2.5,
  },
  dashedLine: {
    stroke: "#dc2626",
    strokeWidth: 2,
    strokeDasharray: "5,5",
  },
  vertexLabel: {
    fontSize: "16px",
    fontWeight: "bold",
    fill: "#0f172a",
    fontFamily: "Arial, sans-serif",
  },
  resultValue: {
    fill: "#dc2626",
    fontSize: "13px",
    fontWeight: "bold",
    textAnchor: "middle",
    dominantBaseline: "middle",
  },
  input: {
    position: "absolute",
    width: "62px",
    height: "30px",
    padding: "2px",
    textAlign: "center",
    borderRadius: "6px",
    outline: "none",
    background: "#ffffff",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 10,
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  },
  button: {
    marginTop: "15px",
    padding: "10px 24px",
    fontSize: "15px",
    fontWeight: "600",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    maxWidth: "200px",
  },
  error: {
    color: "#dc2626",
    marginTop: "10px",
    fontSize: "14px",
  },
  resultCard: {
    marginTop: "20px",
    padding: "12px",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    color: "#0369a1",
    fontSize: "15px",
    lineHeight: "1.8",
    textAlign: "center",
  },
};

export default Nos;