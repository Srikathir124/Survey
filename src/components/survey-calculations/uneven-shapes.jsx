import React, { useState } from "react";
import AreaConversion from "./areaconversion";
import { trackEvent } from "../../utils/analytics.js";

function UnevenShapes() {
  const SVG_BASE_WIDTH = 420;
  const SVG_BASE_HEIGHT = 380;
  // =========================================================
  // QUADRILATERAL ABCD
  //
  // A -------- B
  // | \        |
  // |  \ AC    |
  // D -------- C
  //
  // Area ABCD = Area ABC + Area ADC
  // =========================================================
  const quadPoints = {
    A: { x: 60, y: 100 },
    B: { x: 340, y: 70 },
    C: { x: 360, y: 300 },
    D: { x: 80, y: 330 },
  };
  // =========================================================
  // TRIANGLE ABC
  //
  //        B
  //       / \
  //      /   \
  //     A-----C
  //
  // Area ABC = Area ABC
  // =========================================================
  const triPoints = {
    A: { x: 60, y: 300 },
    B: { x: 210, y: 70 },
    C: { x: 360, y: 300 },
  };
  // =========================================================
  // PENTAGON ABCDE
  //
  //        B
  //      /   \
  //     A--AC--C
  //     |      /\
  //     |  CE /  \
  //     E----    D
  //
  // Area ABCDE = ABC + ACE + CED
  // =========================================================
  const pentPoints = {
    A: { x: 60, y: 170 },
    B: { x: 210, y: 60 },
    C: { x: 360, y: 170 },
    D: { x: 290, y: 350 },
    E: { x: 100, y: 350 },
  };
  // =========================================================
  // STATE
  // =========================================================
  const [quadValues, setQuadValues] = useState({
    AB: "",
    BC: "",
    CD: "",
    DA: "",
    AC: "",
  });
  const [triValues, setTriValues] = useState({
    AB: "",
    BC: "",
    CA: "",
  });
  const [pentValues, setPentValues] = useState({
    AB: "",
    BC: "",
    CD: "",
    DE: "",
    EA: "",
    AC: "",
    CE: "",
  });
  const [quadErrors, setQuadErrors] = useState({});
  const [triErrors, setTriErrors] = useState({});
  const [pentErrors, setPentErrors] = useState({});
  const [quadErrorMsg, setQuadErrorMsg] = useState("");
  const [triErrorMsg, setTriErrorMsg] = useState("");
  const [pentErrorMsg, setPentErrorMsg] = useState("");
  const [quadResult, setQuadResult] = useState(null);
  const [triResult, setTriResult] = useState(null);
  const [pentResult, setPentResult] = useState(null);
  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================
  // Find angle of a line
  const getAngle = (p1, p2) => {
    return (
      (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) /
      Math.PI
    );
  };
  // Find midpoint of a line
  const getMidpoint = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };
  /*
   * Returns a point near the midpoint of a line,
   * offset in a specified direction.
   *
   * offsetX / offsetY allow us to manually control
   * which side of the boundary the textbox appears on.
   */
  const getPosition = (
    p1,
    p2,
    offsetX = 0,
    offsetY = 0
  ) => {
    const mid = getMidpoint(p1, p2);
    return {
      x: mid.x + offsetX,
      y: mid.y + offsetY,
    };
  };
  // =========================================================
  // HERON'S FORMULA
  // =========================================================
  const triangleArea = (a, b, c) => {
    const s = (a + b + c) / 2;
    const value =
      s *
      (s - a) *
      (s - b) *
      (s - c);
    if (value <= 0) {
      return null;
    }
    return Math.sqrt(value);
  };
  // =========================================================
  // INPUT CHANGE - QUADRILATERAL
  // =========================================================
  const handleQuadChange = (key, value) => {
    setQuadValues({
      ...quadValues,
      [key]: value,
    });
    setQuadErrors({
      ...quadErrors,
      [key]: false,
    });
    setQuadErrorMsg("");
  };
  // =========================================================
  // INPUT CHANGE - TRIANGLE
  // =========================================================
  const handleTriChange = (key, value) => {
    setTriValues({
      ...triValues,
      [key]: value,
    });
    setTriErrors({
      ...triErrors,
      [key]: false,
    });
    setTriErrorMsg("");
  };
  // =========================================================
  // INPUT CHANGE - PENTAGON
  // =========================================================
  const handlePentChange = (key, value) => {
    setPentValues({
      ...pentValues,
      [key]: value,
    });
    setPentErrors({
      ...pentErrors,
      [key]: false,
    });
    setPentErrorMsg("");
  };
  // =========================================================
  // CALCULATE QUADRILATERAL
  // ABCD = ABC + ADC
  // =========================================================
  const calculateQuadrilateral = () => {
    const required = [
      "AB",
      "BC",
      "CD",
      "DA",
      "AC",
    ];
    const newErrors = {};
    const missing = [];
    required.forEach((key) => {
      if (
        quadValues[key] === "" ||
        Number(quadValues[key]) <= 0
      ) {
        newErrors[key] = true;
        missing.push(key);
      }
    });
    setQuadErrors(newErrors);
    // Check if all 4 sides are entered but AC is missing
    const allSidesEntered = 
      quadValues.AB !== "" && Number(quadValues.AB) > 0 &&
      quadValues.BC !== "" && Number(quadValues.BC) > 0 &&
      quadValues.CD !== "" && Number(quadValues.CD) > 0 &&
      quadValues.DA !== "" && Number(quadValues.DA) > 0;
    const acMissing = 
      quadValues.AC === "" || Number(quadValues.AC) <= 0;
    if (allSidesEntered && acMissing) {
      // Calculate approximate area using Kasara method
      const AB = parseFloat(quadValues.AB);
      const BC = parseFloat(quadValues.BC);
      const CD = parseFloat(quadValues.CD);
      const DA = parseFloat(quadValues.DA);
      const avgLength = (AB + CD) / 2;
      const avgWidth = (BC + DA) / 2;
      const approximateArea = avgLength * avgWidth;
      setQuadErrorMsg(
        "AC is not entered, Hence calculating the approximate area by Kasara method (multiplying the average length and average width). Please enter AC"
      );
      setQuadResult({
        areaABC: null,
        areaADC: null,
        totalArea: approximateArea.toFixed(3),
        isApproximate: true,
      });
      return;
    }
    if (missing.length > 0) {
      setQuadErrorMsg(
        `${missing.join(", ")} missing or invalid`
      );
      setQuadResult(null);
      return;
    }
    const AB = parseFloat(quadValues.AB);
    const BC = parseFloat(quadValues.BC);
    const CD = parseFloat(quadValues.CD);
    const DA = parseFloat(quadValues.DA);
    const AC = parseFloat(quadValues.AC);
    // Triangle ABC
    const areaABC = triangleArea(
      AB,
      BC,
      AC
    );
    // Triangle ADC
    const areaADC = triangleArea(
      DA,
      CD,
      AC
    );
    if (
      areaABC === null ||
      areaADC === null
    ) {
      setQuadErrorMsg(
        "The entered lengths cannot form valid triangles. Please check the measurements."
      );
      setQuadResult(null);
      return;
    }
    const totalArea =
      areaABC + areaADC;
    setQuadResult({
      areaABC: areaABC.toFixed(3),
      areaADC: areaADC.toFixed(3),
      totalArea: totalArea.toFixed(3),
      isApproximate: false,
    });
    setQuadErrorMsg("");    
    trackEvent("Quadilateral_calculator_used", {
            calculator_name: "Quadilateral Area"
    });
  };
  // =========================================================
  // CALCULATE TRIANGLE
  // ABC
  // =========================================================
  const calculateTriangle = () => {
    const required = ["AB", "BC", "CA"];
    const newErrors = {};
    const missing = [];
    required.forEach((key) => {
      if (
        triValues[key] === "" ||
        Number(triValues[key]) <= 0
      ) {
        newErrors[key] = true;
        missing.push(key);
      }
    });
    setTriErrors(newErrors);
    if (missing.length > 0) {
      setTriErrorMsg(
        `${missing.join(", ")} missing or invalid`
      );
      setTriResult(null);
      return;
    }
    const AB = parseFloat(triValues.AB);
    const BC = parseFloat(triValues.BC);
    const CA = parseFloat(triValues.CA);
    // Triangle ABC
    const areaABC = triangleArea(AB, BC, CA);
    if (areaABC === null) {
      setTriErrorMsg(
        "The entered lengths cannot form a valid triangle. Please check the measurements."
      );
      setTriResult(null);
      return;
    }
    setTriResult({
      totalArea: areaABC.toFixed(3),
    });
    setTriErrorMsg("");
    
    trackEvent("Triangle_calculator_used", {
            calculator_name: "Triangle Area"
    });
  };
  // =========================================================
  // CALCULATE PENTAGON
  // ABCDE = ABC + ACE + CED
  // =========================================================
  const calculatePentagon = () => {
    const required = [
      "AB",
      "BC",
      "CD",
      "DE",
      "EA",
      "AC",
      "CE",
    ];
    const newErrors = {};
    const missing = [];
    required.forEach((key) => {
      if (
        pentValues[key] === "" ||
        Number(pentValues[key]) <= 0
      ) {
        newErrors[key] = true;
        missing.push(key);
      }
    });
    setPentErrors(newErrors);
    // Check if all 5 sides are entered but AC and/or CE are missing
    const allSidesEntered = 
      pentValues.AB !== "" && Number(pentValues.AB) > 0 &&
      pentValues.BC !== "" && Number(pentValues.BC) > 0 &&
      pentValues.CD !== "" && Number(pentValues.CD) > 0 &&
      pentValues.DE !== "" && Number(pentValues.DE) > 0 &&
      pentValues.EA !== "" && Number(pentValues.EA) > 0;
    const acMissing = 
      pentValues.AC === "" || Number(pentValues.AC) <= 0;
    const ceMissing = 
      pentValues.CE === "" || Number(pentValues.CE) <= 0;
    if (allSidesEntered && (acMissing || ceMissing)) {
      // Calculate approximate area using Kasara method
      const AB = parseFloat(pentValues.AB);
      const BC = parseFloat(pentValues.BC);
      const CA = parseFloat(pentValues.EA); // Using EA as the third side for triangle approximation
      const CD = parseFloat(pentValues.CD);
      const DE = parseFloat(pentValues.DE);
      const EA = parseFloat(pentValues.EA);
      // Area of triangle ABC using Heron's formula (approximating with AB, BC, and imaginary AC)
      // Since AC is not available, we'll use AB, BC, and EA as an approximation
      const areaABC = triangleArea(AB, BC, EA);
      // Area of quadrilateral ACED using Kasara formula: ((AE+CD)/2)*DE
      const avgLength = (EA + CD) / 2;
      const areaACED = avgLength * DE;
      let totalApproximateArea = 0;
      let warningMessage = "";
      if (acMissing && ceMissing) {
        // Both AC and CE missing
        warningMessage = "AC/CE not entered, Hence calculating approximate area by Kasara method. Please enter AC and CE";
        totalApproximateArea = (areaABC || 0) + areaACED;
      } else if (acMissing) {
        // Only AC missing
        warningMessage = "AC not entered, Hence calculating approximate area by Kasara method. Please enter AC";
        totalApproximateArea = (areaABC || 0) + areaACED;
      } else {
        // Only CE missing
        warningMessage = "CE not entered, Hence calculating approximate area by Kasara method. Please enter CE";
        totalApproximateArea = (areaABC || 0) + areaACED;
      }
      setPentErrorMsg(warningMessage);
      setPentResult({
        areaABC: areaABC ? areaABC.toFixed(3) : null,
        areaACE: null,
        areaCED: null,
        areaACED: areaACED.toFixed(3),
        totalArea: totalApproximateArea.toFixed(3),
        isApproximate: true,
      });
      return;
    }
    if (missing.length > 0) {
      setPentErrorMsg(
        `${missing.join(", ")} missing or invalid`
      );
      setPentResult(null);
      return;
    }
    const AB = parseFloat(pentValues.AB);
    const BC = parseFloat(pentValues.BC);
    const CD = parseFloat(pentValues.CD);
    const DE = parseFloat(pentValues.DE);
    const EA = parseFloat(pentValues.EA);
    const AC = parseFloat(pentValues.AC);
    const CE = parseFloat(pentValues.CE);
    // Triangle ABC
    const areaABC = triangleArea(
      AB,
      BC,
      AC
    );
    // Triangle ACE
    const areaACE = triangleArea(
      AC,
      CE,
      EA
    );
    // Triangle CED
    const areaCED = triangleArea(
      CE,
      DE,
      CD
    );
    if (
      areaABC === null ||
      areaACE === null ||
      areaCED === null
    ) {
      setPentErrorMsg(
        "The entered lengths cannot form valid triangles. Please check the measurements."
      );
      setPentResult(null);
      return;
    }
    const totalArea =
      areaABC +
      areaACE +
      areaCED;
    setPentResult({
      areaABC: areaABC.toFixed(3),
      areaACE: areaACE.toFixed(3),
      areaCED: areaCED.toFixed(3),
      totalArea: totalArea.toFixed(3),
      isApproximate: false,
    });
    setPentErrorMsg("");
    trackEvent("Pentagon_calculator_used", {
            calculator_name: "Pentagon Area"
    });
  };
  // =========================================================
  // QUADRILATERAL INPUT POSITIONS
  // =========================================================
  const quadAB = getPosition(
    quadPoints.A,
    quadPoints.B,
    0,
    -25
  );
  const quadBC = getPosition(
    quadPoints.C,
    quadPoints.B,
    25,
    0
  );
  const quadCD = getPosition(
    quadPoints.D,
    quadPoints.C,
    0,
    25
  );
  const quadDA = getPosition(
    quadPoints.D,
    quadPoints.A,
    -25,
    0
  );
  const quadAC = getMidpoint(
    quadPoints.A,
    quadPoints.C
  );
  // =========================================================
  // QUADRILATERAL ANGLES
  // =========================================================
  const quadAngleAB = getAngle(
    quadPoints.A,
    quadPoints.B
  );
  const quadAngleBC = getAngle(
    quadPoints.C,
    quadPoints.B
  );
  const quadAngleCD = getAngle(
    quadPoints.D,
    quadPoints.C
  );
  const quadAngleDA = getAngle(
    quadPoints.D,
    quadPoints.A
  );
  const quadAngleAC = getAngle(
    quadPoints.A,
    quadPoints.C
  );
  // =========================================================
  // TRIANGLE INPUT POSITIONS & ANGLES
  // =========================================================
  const triAB = getPosition(triPoints.A, triPoints.B, -15, -25);
  const triBC = getPosition(triPoints.B, triPoints.C, 25, -15);
  const triCA = getPosition(triPoints.A, triPoints.C, 0, 20);
  const triAngleAB = getAngle(triPoints.A, triPoints.B);
  const triAngleBC = getAngle(triPoints.B, triPoints.C);
  const triAngleCA = getAngle(triPoints.A, triPoints.C);
  // =========================================================
  // PENTAGON INPUT POSITIONS
  // =========================================================
  const pentAB = getPosition(
    pentPoints.A,
    pentPoints.B,
    -12,
    -22
  );
  const pentBC = getPosition(
    pentPoints.B,
    pentPoints.C,
    12,
    -22
  );
  const pentCD = getPosition(
    pentPoints.D,
    pentPoints.C,
    25,
    0
  );
  const pentDE = getPosition(
    pentPoints.E,
    pentPoints.D,
    0,
    25
  );
  const pentEA = getPosition(
    pentPoints.E,
    pentPoints.A,
    -25,
    0
  );
  const pentAC = getMidpoint(
    pentPoints.A,
    pentPoints.C
  );
  const pentCE = getMidpoint(
    pentPoints.E,
    pentPoints.C
  );
  // =========================================================
  // PENTAGON ANGLES
  // =========================================================
  const pentAngleAB = getAngle(
    pentPoints.A,
    pentPoints.B
  );
  const pentAngleBC = getAngle(
    pentPoints.B,
    pentPoints.C
  );
  const pentAngleCD = getAngle(
    pentPoints.D,
    pentPoints.C
  );
  const pentAngleDE = getAngle(
    pentPoints.E,
    pentPoints.D
  );
  const pentAngleEA = getAngle(
    pentPoints.E,
    pentPoints.A
  );
  const pentAngleAC = getAngle(
    pentPoints.A,
    pentPoints.C
  );
  const pentAngleCE = getAngle(
    pentPoints.E,
    pentPoints.C
  );
  // =========================================================
  // COMMON INPUT STYLE
  // =========================================================
  const getInputStyle = (position, angle, error, baseHeight = SVG_BASE_HEIGHT) => ({
    ...styles.input,
    top: `${(position.y / baseHeight) * 100}%`,
    left: `${(position.x / SVG_BASE_WIDTH) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
    border: error ? "2px solid red" : "1px solid #ccc",
  });
  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div style={styles.container}>
      <AreaConversion/>     
      {/* ================================================= */}
      {/* QUADRILATERAL */}
      {/* ================================================= */}
      <div style={styles.card}>
        <h2 style={styles.heading}>
          Irregular Quadrilateral
        </h2>
        <p style={styles.description}>
          Enter the lengths of all sides and diagonal AC.
          The area is calculated as ABC + ADC.
        </p>
        <div style={styles.canvas}>
          <svg viewBox="0 0 420 380" style={styles.svg}>
            {/* Outer Shape */}
            <polygon
              points={`
                ${quadPoints.A.x},${quadPoints.A.y}
                ${quadPoints.B.x},${quadPoints.B.y}
                ${quadPoints.C.x},${quadPoints.C.y}
                ${quadPoints.D.x},${quadPoints.D.y}
              `}
              style={styles.shape}
            />
            {/* AC Diagonal */}
            <line
              x1={quadPoints.A.x}
              y1={quadPoints.A.y}
              x2={quadPoints.C.x}
              y2={quadPoints.C.y}
              style={styles.dashedLine}
            />
            {/* Points */}
            {Object.entries(quadPoints).map(
              ([key, point]) => (
                <circle
                  key={key}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="black"
                />
              )
            )}
            {/* Labels */}
            <text
              x={quadPoints.A.x - 15}
              y={quadPoints.A.y - 10}
              style={styles.label}
            >
              A
            </text>
            <text
              x={quadPoints.B.x + 5}
              y={quadPoints.B.y - 10}
              style={styles.label}
            >
              B
            </text>
            <text
              x={quadPoints.C.x + 5}
              y={quadPoints.C.y + 15}
              style={styles.label}
            >
              C
            </text>
            <text
              x={quadPoints.D.x - 15}
              y={quadPoints.D.y + 20}
              style={styles.label}
            >
              D
            </text>
          </svg>
          {/* AB INPUT */}
          <input
            type="number"
            placeholder="AB"
            value={quadValues.AB}
            onChange={(e) =>
              handleQuadChange("AB", e.target.value)
            }
            style={getInputStyle(quadAB, quadAngleAB, quadErrors.AB)}
          />
          {/* BC INPUT */}
          <input
            type="number"
            placeholder="BC"
            value={quadValues.BC}
            onChange={(e) =>
              handleQuadChange("BC", e.target.value)
            }
            style={getInputStyle(quadBC, quadAngleBC, quadErrors.BC)}
          />
          {/* CD INPUT */}
          <input
            type="number"
            placeholder="CD"
            value={quadValues.CD}
            onChange={(e) =>
              handleQuadChange("CD", e.target.value)
            }
            style={getInputStyle(quadCD, quadAngleCD, quadErrors.CD)}
          />
          {/* DA INPUT */}
          <input
            type="number"
            placeholder="DA"
            value={quadValues.DA}
            onChange={(e) =>
              handleQuadChange("DA", e.target.value)
            }
            style={getInputStyle(quadDA, quadAngleDA, quadErrors.DA)}
          />
          {/* AC INPUT */}
          <input
            type="number"
            placeholder="AC"
            value={quadValues.AC}
            onChange={(e) =>
              handleQuadChange("AC", e.target.value)
            }
            style={getInputStyle(quadAC, quadAngleAC, quadErrors.AC)}
          />
        </div>
        {/* Error */}
        {quadErrorMsg && (
          <div style={{
            ...styles.error,
            color: quadResult?.isApproximate ? "#d97706" : "red",
            backgroundColor: quadResult?.isApproximate ? "#fef3c7" : "transparent",
            padding: quadResult?.isApproximate ? "10px" : "0",
            borderRadius: quadResult?.isApproximate ? "6px" : "0",
            border: quadResult?.isApproximate ? "1px solid #d97706" : "none",
          }}>
            {quadErrorMsg}
          </div>
        )}
        {/* Result */}
        {quadResult && (
          <div style={styles.result}>
            {quadResult.isApproximate ? (
              <div style={{
                ...styles.total,
                background: "#fef3c7",
                color: "#92400e",
              }}>
                Approximate Area of ABCD = {quadResult.totalArea} m² 
              </div>
            ) : (
              <>
                <div>
                  <b>Area of ABC = {quadResult.areaABC} m²</b>
                </div>
                <div>
                  <b>Area of ADC = {quadResult.areaADC} m²</b>
                </div>
                <div style={styles.total}>
                  Total Area of ABCD = {quadResult.totalArea} m²
                </div>
              </>
            )}
          </div>
        )}
        {/* Calculate */}
        <button
          onClick={calculateQuadrilateral}
          style={styles.button}
        >
          Calculate Area
        </button>
      </div>
      {/* ================================================= */}
      {/* IRREGULAR TRIANGLE */}
      {/* ================================================= */}
      <div style={styles.card}>
        <h2 style={styles.heading}>
          Irregular Triangle
        </h2>
        <p style={styles.description}>
          Enter the lengths of all three sides.
          The area is calculated using Heron's formula.
        </p>
        <div style={styles.canvas}>
          <svg viewBox="0 0 420 350" style={styles.svg}>
            {/* Triangle Shape */}
            <polygon
              points={`
                ${triPoints.A.x},${triPoints.A.y}
                ${triPoints.B.x},${triPoints.B.y}
                ${triPoints.C.x},${triPoints.C.y}
              `}
              style={styles.shape}
            />
            {/* Points */}
            {Object.entries(triPoints).map(([key, point]) => (
              <circle
                key={key}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="black"
              />
            ))}
            {/* Labels */}
            <text
              x={triPoints.A.x - 15}
              y={triPoints.A.y + 15}
              style={styles.label}
            >
              A
            </text>
            <text
              x={triPoints.B.x - 5}
              y={triPoints.B.y - 10}
              style={styles.label}
            >
              B
            </text>
            <text
              x={triPoints.C.x + 5}
              y={triPoints.C.y + 15}
              style={styles.label}
            >
              C
            </text>
          </svg>
          {/* AB INPUT */}
          <input
            type="number"
            placeholder="AB"
            value={triValues.AB}
            onChange={(e) =>
              handleTriChange("AB", e.target.value)
            }
            style={getInputStyle(triAB, triAngleAB, triErrors.AB, 350)}
          />
          {/* BC INPUT */}
          <input
            type="number"
            placeholder="BC"
            value={triValues.BC}
            onChange={(e) =>
              handleTriChange("BC", e.target.value)
            }
            style={getInputStyle(triBC, triAngleBC, triErrors.BC, 350)}
          />
          {/* CA INPUT */}
          <input
            type="number"
            placeholder="AC"
            value={triValues.CA}
            onChange={(e) =>
              handleTriChange("CA", e.target.value)
            }
            style={getInputStyle(triCA, triAngleCA, triErrors.CA, 350)}
          />
        </div>
        {/* Error */}
        {triErrorMsg && (
          <div style={styles.error}>
            {triErrorMsg}
          </div>
        )}
        {/* Result */}
        {triResult && (
          <div style={styles.result}>
            <div style={styles.total}>
              Total Area of ABC = {triResult.totalArea} m²
            </div>
          </div>
        )}
        {/* Calculate */}
        <button
          onClick={calculateTriangle}
          style={styles.button}
        >
          Calculate Area
        </button>
      </div>
      {/* ================================================= */}
      {/* PENTAGON */}
      {/* ================================================= */}
      <div style={styles.card}>
        <h2 style={styles.heading}>
          Irregular Pentagon
        </h2>
        <p style={styles.description}>
          Enter the lengths of all sides and diagonals.
          The area is calculated as ABC + ACE + CED.
        </p>
        <div style={styles.canvas}>
          <svg viewBox="0 0 420 400" style={styles.svg}>
            {/* Pentagon */}
            <polygon
              points={`
                ${pentPoints.A.x},${pentPoints.A.y}
                ${pentPoints.B.x},${pentPoints.B.y}
                ${pentPoints.C.x},${pentPoints.C.y}
                ${pentPoints.D.x},${pentPoints.D.y}
                ${pentPoints.E.x},${pentPoints.E.y}
              `}
              style={styles.shape}
            />
            {/* AC */}
            <line
              x1={pentPoints.A.x}
              y1={pentPoints.A.y}
              x2={pentPoints.C.x}
              y2={pentPoints.C.y}
              style={styles.dashedLine}
            />
            {/* CE */}
            <line
              x1={pentPoints.C.x}
              y1={pentPoints.C.y}
              x2={pentPoints.E.x}
              y2={pentPoints.E.y}
              style={styles.dashedLine}
            />
            {/* Points */}
            {Object.entries(pentPoints).map(([key, point]) => (
              <circle
                key={key}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="black"
              />
            ))}
            {/* Labels */}
            <text
              x={pentPoints.A.x - 15}
              y={pentPoints.A.y}
              style={styles.label}
            >
              A
            </text>
            <text
              x={pentPoints.B.x - 5}
              y={pentPoints.B.y - 10}
              style={styles.label}
            >
              B
            </text>
            <text
              x={pentPoints.C.x + 5}
              y={pentPoints.C.y}
              style={styles.label}
            >
              C
            </text>
            <text
              x={pentPoints.D.x + 5}
              y={pentPoints.D.y + 15}
              style={styles.label}
            >
              D
            </text>
            <text
              x={pentPoints.E.x - 15}
              y={pentPoints.E.y + 15}
              style={styles.label}
            >
              E
            </text>
          </svg>
          {/* AB */}
          <input
            type="number"
            placeholder="AB"
            value={pentValues.AB}
            onChange={(e) =>
              handlePentChange("AB", e.target.value)
            }
            style={getInputStyle(pentAB, pentAngleAB, pentErrors.AB, 400)}
          />
          {/* BC */}
          <input
            type="number"
            placeholder="BC"
            value={pentValues.BC}
            onChange={(e) =>
              handlePentChange("BC", e.target.value)
            }
            style={getInputStyle(pentBC, pentAngleBC, pentErrors.BC, 400)}
          />
          {/* CD */}
          <input
            type="number"
            placeholder="CD"
            value={pentValues.CD}
            onChange={(e) =>
              handlePentChange("CD", e.target.value)
            }
            style={getInputStyle(pentCD, pentAngleCD, pentErrors.CD, 400)}
          />
          {/* DE */}
          <input
            type="number"
            placeholder="DE"
            value={pentValues.DE}
            onChange={(e) =>
              handlePentChange("DE", e.target.value)
            }
            style={getInputStyle(pentDE, pentAngleDE, pentErrors.DE, 400)}
          />
          {/* EA */}
          <input
            type="number"
            placeholder="EA"
            value={pentValues.EA}
            onChange={(e) =>
              handlePentChange("EA", e.target.value)
            }
            style={getInputStyle(pentEA, pentAngleEA, pentErrors.EA, 400)}
          />
          {/* AC */}
          <input
            type="number"
            placeholder="AC"
            value={pentValues.AC}
            onChange={(e) =>
              handlePentChange("AC", e.target.value)
            }
            style={getInputStyle(pentAC, pentAngleAC, pentErrors.AC, 400)}
          />
          {/* CE */}
          <input
            type="number"
            placeholder="CE"
            value={pentValues.CE}
            onChange={(e) =>
              handlePentChange("CE", e.target.value)
            }
            style={getInputStyle(pentCE, pentAngleCE, pentErrors.CE, 400)}
          />
        </div>
        {/* Error */}
        {pentErrorMsg && (
          <div style={{
            ...styles.error,
            color: pentResult?.isApproximate ? "#d97706" : "red",
            backgroundColor: pentResult?.isApproximate ? "#fef3c7" : "transparent",
            padding: pentResult?.isApproximate ? "10px" : "0",
            borderRadius: pentResult?.isApproximate ? "6px" : "0",
            border: pentResult?.isApproximate ? "1px solid #d97706" : "none",
          }}>
            {pentErrorMsg}
          </div>
        )}
        {/* Result */}
        {pentResult && (
          <div style={styles.result}>
            {pentResult.isApproximate ? (
              <>
                {pentResult.areaABC && (
                  <div>
                    <b>Area of ABC = {pentResult.areaABC} m² (Heron's)</b>
                  </div>
                )}
                <div>
                  <b>Area of ACED = {pentResult.areaACED} m² (Kasara)</b>
                </div>
                <div style={{
                  ...styles.total,
                  background: "#fef3c7",
                  color: "#92400e",
                }}>
                  Approximate Area of ABCDE = {pentResult.totalArea} m² 
                </div>
              </>
            ) : (
              <>
                <div>
                  <b>Area of ABC = {pentResult.areaABC} m²</b>
                </div>
                <div>
                  <b>Area of ACE = {pentResult.areaACE} m²</b>
                </div>
                <div>
                  <b>Area of CED = {pentResult.areaCED} m²</b>
                </div>
                <div style={styles.total}>
                  Total Area of ABCDE = {pentResult.totalArea} m²
                </div>
              </>
            )}
          </div>
        )}
        {/* Calculate */}
        <button
          onClick={calculatePentagon}
          style={styles.button}
        >
          Calculate Area
        </button>
      </div>
    </div>
  );
}
// =========================================================
// STYLES
// =========================================================
const styles = {
  container: {
    textAlign: "center",
    marginTop: "20px",
    paddingBottom: "50px",
    fontFamily: "Arial",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "25px",
    color: "#222",
  },
  card: {
    width: "95%",
    maxWidth: "600px",
    margin: "0 auto 30px auto",
    padding: "15px",
    boxSizing: "border-box",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  heading: {
    marginBottom: "10px",
    color: "#222",
    fontSize: "1.3rem",
  },
  description: {
    color: "#555",
    fontSize: "13px",
    marginBottom: "15px",
  },
  canvas: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    aspectRatio: "420 / 380",
    margin: "0 auto",
    overflow: "visible",
  },
  svg: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  shape: {
    fill: "#f9fafb",
    stroke: "#333",
    strokeWidth: 2,
  },
  dashedLine: {
    stroke: "red",
    strokeWidth: 2,
    strokeDasharray: "5,5",
  },
  label: {
    fontSize: "16px",
    fontWeight: "bold",
    fill: "black",
  },
  input: {
    position: "absolute",
    width: "68px",
    height: "24px",
    padding: "2px 4px",
    textAlign: "center",
    borderRadius: "6px",
    outline: "none",
    background: "white",
    fontSize: "12px",
    zIndex: 10,
    boxSizing: "border-box",
    transformOrigin: "center center",
  },
  button: {
    marginTop: "15px",
    padding: "10px 22px",
    fontSize: "15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    maxWidth: "280px",
  },
  error: {
    color: "red",
    marginTop: "10px",
    fontSize: "14px",
  },
  result: {
    marginTop: "20px",
    fontSize: "15px",
    color: "black",
    lineHeight: "1.8",
  },
  total: {
    marginTop: "8px",
    padding: "8px",
    borderRadius: "6px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "16px",
    fontWeight: "bold",
  },
};
export default UnevenShapes;