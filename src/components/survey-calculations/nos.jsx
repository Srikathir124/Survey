import React, { useState } from "react";

function Nos() {
  const A = { x: 80, y: 300 };
  const C = { x: 320, y: 300 };
  const B = { x: 200, y: 60 };

  const D = {
    x: (A.x + C.x) / 2,
    y: (A.y + C.y) / 2
  };

  const midAB = {
    x: (A.x + B.x) / 2,
    y: (A.y + B.y) / 2
  };

  const midBC = {
    x: (B.x + C.x) / 2,
    y: (B.y + C.y) / 2
  };

  const centroid = {
    x: (A.x + B.x + C.x) / 3,
    y: (A.y + B.y + C.y) / 3
  };

  const getAngle = (p1, p2) => {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  };

  const getOffsetPoint = (p1, p2, mid, distance = 30) => {
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
      y: mid.y + ny * distance
    };
  };

  const angleAB = getAngle(A, B);
  const angleBC = getAngle(B, C);
  const angleBD = getAngle(B, D);
  const angleCD = getAngle(C, D);

  const posAB = getOffsetPoint(A, B, midAB);
  const posBC = getOffsetPoint(B, C, midBC);

  const [values, setValues] = useState({
    AB: "",
    BC: "",
    AC: ""
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
      if (!values[key]) {
        newErrors[key] = true;
        missing.push(key);
      }
    });

    setErrors(newErrors);

    if (missing.length > 0) {
      setErrorMsg(`${missing.join(", ")} missing`);
      setResult(null);
      return;
    }

    const AB = parseFloat(values.AB);
    const BC = parseFloat(values.BC);
    const AC = parseFloat(values.AC);

    const AD = (AB * AB + AC * AC - BC * BC) / (2 * AC);
    const CD = (BC * BC + AC * AC - AB * AB) / (2 * AC);
    const BD = Math.sqrt(AB * AB - AD * AD);

    setResult({
      AD: AD.toFixed(1),
      CD: CD.toFixed(1),
      BD: BD.toFixed(1)
    });

    setErrorMsg("");
  };

  // Midpoints for displaying text inside triangle
  const midBD = {
    x: (B.x + D.x) / 2,
    y: (B.y + D.y) / 2
  };

  const midCD = {
    x: (C.x + D.x) / 2,
    y: (C.y + D.y) / 2
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>NOS Calculator</h1>

      <div style={styles.canvas}>
        <svg width="400" height="360">
          <polygon
            points={`${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`}
            style={styles.triangle}
          />

          {/* Blue dashed line */}
          <line
            x1={B.x}
            y1={B.y}
            x2={D.x}
            y2={D.y}
            style={styles.dashedLine}
          />

          {/* D point */}
          <circle cx={D.x} cy={D.y} r="4" fill="blue" />
          <text x={D.x + 5} y={D.y - 5} fill="blue">D</text>

          {/* Labels */}
          <text x={A.x - 5} y={A.y + 15}>A</text>
          <text x={C.x + 5} y={C.y + 15}>C</text>
          <text x={B.x - 5} y={B.y - 10}>B</text>

          {/* 🔴 AD & CD values inside triangle */}
          {result && (
          <>
            {result && (
              <>
                {/* AD value between A and D */}
                <text
                  x={(A.x + D.x) / 2}
                  y={A.y - 10}
                  fill="red"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {result.AD}
                </text>

                {/* CD value between D and C */}
                <text
                  x={(D.x + C.x) / 2}
                  y={C.y - 10}
                  fill="red"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {result.CD}
                </text>

                {/* 🔴 BD value ABOVE BD line */}
                {result && (() => {
                  const midX = (B.x + D.x) / 2;
                  const midY = (B.y + D.y) / 2;

                  // direction vector BD
                  let dx = D.x - B.x;
                  let dy = D.y - B.y;

                  // perpendicular vector
                  let nx = -dy;
                  let ny = dx;

                  // normalize
                  const length = Math.sqrt(nx * nx + ny * ny);
                  nx /= length;
                  ny /= length;

                  // move text outward (adjust 12–18 if needed)
                  const offset = 15;

                  const textX = midX + nx * offset;
                  const textY = midY + ny * offset;

                  return (
                    <text
                      x={textX}
                      y={textY}
                      fill="red"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${angleBD}, ${textX}, ${textY})`}
                    >
                      {result.BD}
                    </text>
                  );
                })()}
              </>
            )}
          </>
        )}
        </svg>

        {/* Inputs */}
        <input
          type="number"
          placeholder="AC"
          value={values.AC}
          onChange={(e) => handleChange("AC", e.target.value)}
          style={{
            ...styles.input,
            top: D.y + 12,
            left: D.x - 35,
            border: errors.AC ? "2px solid red" : "1px solid #ccc"
          }}
        />

        <input
          type="number"
          placeholder="AB"
          value={values.AB}
          onChange={(e) => handleChange("AB", e.target.value)}
          style={{
            ...styles.input,
            top: posAB.y,
            left: posAB.x - 35,
            transform: `rotate(${angleAB}deg)`,
            border: errors.AB ? "2px solid red" : "1px solid #ccc"
          }}
        />

        <input
          type="number"
          placeholder="BC"
          value={values.BC}
          onChange={(e) => handleChange("BC", e.target.value)}
          style={{
            ...styles.input,
            top: posBC.y,
            left: posBC.x - 35,
            transform: `rotate(${angleBC}deg)`,
            border: errors.BC ? "2px solid red" : "1px solid #ccc"
          }}
        />
      </div>

      {/* Error */}
      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      {/* Button */}
      <button onClick={handleCalculate} style={styles.button}>
        Calculate
      </button>

      {/* Result */}
      {result && (
        <div style={{ marginTop: "15px", fontSize: "16px", color: "black" }}>
          <div><b>AD = {result.AD}</b></div>
          <div><b>CD = {result.CD}</b></div>
          <div><b>BD (height) = {result.BD}</b></div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "40px",
    fontFamily: "Arial"
  },
  title: {
    marginBottom: "20px"
  },
  canvas: {
    position: "relative",
    width: "300px",
    margin: "auto"
  },
  triangle: {
    fill: "#f9fafb",
    stroke: "#333",
    strokeWidth: 2
  },
  dashedLine: {
    stroke: "blue",
    strokeWidth: 2,
    strokeDasharray: "5,5"
  },
  input: {
    position: "absolute",
    width: "70px",
    padding: "4px",
    textAlign: "center",
    borderRadius: "6px",
    outline: "none"
  },
  button: {
    marginTop: "15px",
    padding: "10px 18px",
    fontSize: "15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginTop: "10px"
  },
  resultText: {
    fill: "red",
    fontSize: "12px",
    fontWeight: "bold"
  }
};

export default Nos;