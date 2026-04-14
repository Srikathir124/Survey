import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/navbar";
import Nos from "./components/survey-calculations/nos";
import Pythagoras from "./components/survey-calculations/pythogoras";
import OffsetIntersectionUI from "./components/survey-calculations/intersection";

function App() {
  const [page, setPage] = useState("nos");

  const renderPage = () => {
    switch (page) {
      case "nos":
        return <Nos />;
      case "pythagoras":
        return <Pythagoras />;
      case "intersection":
        return <OffsetIntersectionUI/>
      default:
        return <Nos />;
    }
  };

  return (
    <div style={styles.container}>
    <Navbar setPage={setPage} currentPage={page} />
      <div style={{ marginTop: "60px", padding: "20px" }}>
        {renderPage()}
      </div>
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