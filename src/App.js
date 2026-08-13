import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/navbar";
import LengthConversion from "./components/common/lengthconversion";
import UnevenShapes from "./components/survey-calculations/uneven-shapes";
import Pythagoras from "./components/survey-calculations/pythogoras";
import Nos from "./components/survey-calculations/nos";
import OffsetIntersectionUI from "./components/survey-calculations/intersection";
import NotesPanel from "./components/common/notes";
import FLineReport from "./components/surveyor-statements/fline";
import ARegCorrection from "./components/surveyor-statements/ARegCorrection";
import DepartmentalExam from "./components/departmental-exam/departmentalexam";
import ConversionQuiz from "./components/departmental-exam/conversionquiz";
import Help from "./components/help";

function App() {
  return (
    <div style={styles.container}>
      <Navbar />
      <div style={{ marginTop: "60px", padding: "20px", flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate replace to="/unevenshapes" />} />
          <Route path="/unevenshapes" element={<UnevenShapes />} />
          <Route path="/pythagoras" element={<Pythagoras />} />
          <Route path="/nos" element={<Nos />} />
          <Route path="/intersection" element={<OffsetIntersectionUI />} />
          <Route path="/fline" element={<FLineReport />} />
          <Route path="/a-reg-correction" element={<ARegCorrection />} />
          <Route path="/conversion-quiz" element={<ConversionQuiz />} />
          <Route path="/departmental-exam" element={<DepartmentalExam />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Navigate replace to="/unevenshapes" />} />
        </Routes>
      </div>
      <LengthConversion />
      <NotesPanel />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
  },
};

export default App;