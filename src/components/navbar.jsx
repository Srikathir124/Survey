import React from "react";

function Navbar({ setPage }) {
  return (
    <div style={styles.navbar}>

      <button style={styles.link} onClick={() => setPage("nos")}>
        NOS Calculator
      </button>

      <button style={styles.link} onClick={() => setPage("intersection")}>
        Intersection Calculator
      </button>

      <button style={styles.link} onClick={() => setPage("pythagoras")}>
        Pythagoras Calculator
      </button>
    </div>
  );
}

const styles = {
  navbar: {
    width: "220px",
    height: "100vh",
    background: "#1e1e2f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "20px",
  },
  link: {
    background: "transparent",
    border: "none",
    color: "#fff",
    textAlign: "left",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Navbar;