import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/navbar";
import LengthConversion from "./components/lengthconversion";
import AreaConversion from "./components/survey-calculations/areaconversion";
import UnevenShapes from "./components/survey-calculations/uneven-shapes";
import Pythagoras from "./components/survey-calculations/pythogoras";
import Nos from "./components/survey-calculations/nos";
import OffsetIntersectionUI from "./components/survey-calculations/intersection";
import NotesPanel from "./components/notes";

function App() {
  const [page, setPage] = useState("unevenshapes");

  const renderPage = () => {
    switch (page) {
      case "nos":
        return <Nos />;
      case "pythagoras":
        return <Pythagoras />;
      case "intersection":
        return <OffsetIntersectionUI/>
      case "areaconversion":
        return <AreaConversion/>
      case "unevenshapes":
        return <UnevenShapes/>
      default:
        return <UnevenShapes/>;
    }
  };

  return (
    <div style={styles.container}>
      <Navbar setPage={setPage} currentPage={page} />
      <div style={{ marginTop: "60px", padding: "20px" }}>
        {renderPage()}
      </div>
      <LengthConversion/>
      <NotesPanel/>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
  },
  content: {
    flex: 1,
    padding: "20px",
  },
};

export default App;