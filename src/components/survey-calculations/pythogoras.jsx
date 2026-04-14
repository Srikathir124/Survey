import React, { useState } from "react";

function Pythagoras() {
  const A = { x: 60, y: 260 };
  const B = { x: 300, y: 260 };
  const C = { x: 60, y: 60 };

  const [values, setValues] = useState({
    AB: "",
    AC: "",
    BC: ""
  });

  const [result, setResult] = useState({});
  const [error, setError] = useState("");

  // 🔹 Helpers
  const getAngle = (p1, p2) => {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  };

  const centroid = {
    x: (A.x + B.x + C.x) / 3,
    y: (A.y + B.y + C.y) / 3
  };

  const getOffsetPoint = (p1, p2, mid, distance = 35) => {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    // perpendicular vector
    let nx = -dy;
    let ny = dx;

    const length = Math.sqrt(nx * nx + ny * ny);
    nx /= length;
    ny /= length;

    // direction check
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

  // 🔹 Midpoints
  const midAB = {
    x: (A.x + B.x) / 2,
    y: (A.y + B.y) / 2
  };

  const midAC = {
    x: (A.x + C.x) / 2,
    y: (A.y + C.y) / 2
  };

  const midBC = {
    x: (B.x + C.x) / 2,
    y: (B.y + C.y) / 2
  };

  // 🔹 Angles
  const angleAB = getAngle(A, B);
  const angleAC = getAngle(A, C);
  const angleBC = getAngle(B, C);

  // 🔹 OUTER positions
  const posAC = getOffsetPoint(A, C, midAC);
  const posBC = getOffsetPoint(B, C, midBC);

  const handleChange = (key, val) => {
    setValues({ ...values, [key]: val });
    setError("");
    setResult({});
  };

  const handleCalculate = () => {
    const AB = parseFloat(values.AB);
    const AC = parseFloat(values.AC);
    const BC = parseFloat(values.BC);

    let filled = [AB, AC, BC].filter(v => !isNaN(v)).length;

    if (filled < 2) {
      setError("Enter any two values");
      return;
    }

    let res = {};

    if (!BC && AB && AC) {
      res.BC = Math.sqrt(AB * AB + AC * AC).toFixed(1);
    } else if (!AB && BC && AC) {
      res.AB = Math.sqrt(BC * BC - AC * AC).toFixed(1);
    } else if (!AC && BC && AB) {
      res.AC = Math.sqrt(BC * BC - AB * AB).toFixed(1);
    } else {
      setError("Enter only two values");
      return;
    }

    setResult(res);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pythagoras Calculator</h1>

      <div style={styles.canvas}>
        <svg width="360" height="300">
          {/* Triangle */}
          <polygon
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            style={styles.triangle}
          />

          {/* Labels */}
          <text x={A.x - 10} y={A.y + 15}>A</text>
          <text x={B.x + 5} y={B.y + 15}>B</text>
          <text x={C.x - 10} y={C.y - 10}>C</text>

          {/* Right angle marker */}
          <rect x={A.x} y={A.y - 15} width="15" height="15" fill="black" />

          {/* Result inside triangle */}
          {result.BC && (
            <text
              x="180"
              y="150"
              fill="red"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              {result.BC}
            </text>
          )}
        </svg>

        {/* AB (bottom) */}
        <input
          type="number"
          placeholder="AB"
          value={values.AB}
          onChange={(e) => handleChange("AB", e.target.value)}
          style={{
            ...styles.input,
            top: midAB.y + 12,
            left: midAB.x - 35
          }}
        />

        {/* 🔥 AC (outside + aligned) */}
        <input
          type="number"
          placeholder="AC"
          value={values.AC}
          onChange={(e) => handleChange("AC", e.target.value)}
          style={{
            ...styles.input,
            top: posAC.y,
            left: posAC.x - 35,
            transform: `rotate(${angleAC}deg)`
          }}
        />

        {/* 🔥 BC (outside + aligned) */}
        <input
          type="number"
          placeholder="BC"
          value={values.BC}
          onChange={(e) => handleChange("BC", e.target.value)}
          style={{
            ...styles.input,
            top: posBC.y,
            left: posBC.x - 35,
            transform: `rotate(${angleBC}deg)`
          }}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button onClick={handleCalculate} style={styles.button}>
        Calculate
      </button>

      {/* Results */}
      {result.BC && <div><b>BC (hypotenuse) = {result.BC}</b></div>}
      {result.AB && <div><b>AB = {result.AB}</b></div>}
      {result.AC && <div><b>AC = {result.AC}</b></div>}
    </div>
  )
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
    width: "360px",
    margin: "auto"
  },
  triangle: {
    fill: "#f9fafb",
    stroke: "#333",
    strokeWidth: 2
  },
  input: {
    position: "absolute",
    width: "70px",
    padding: "4px",
    textAlign: "center",
    borderRadius: "6px",
    border: "1px solid #ccc",
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
  }
};

export default Pythagoras;