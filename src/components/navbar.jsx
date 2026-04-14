import React, { useState } from "react";

function Navbar({ setPage, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (page) => {
    setPage(page);
    setIsOpen(false);
  };

  const getLinkStyle = (page) => ({
    ...styles.link,
    backgroundColor: currentPage === page ? "#2e2e48" : "transparent",
    fontWeight: currentPage === page ? "bold" : "normal",
    borderRadius: "6px",
    padding: "10px",
  });

  return (
    <>
      {/* 🔹 Top Bar */}
      <div style={styles.topbar}>
        <button
          style={styles.burger}
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
        <span style={styles.heading}>Calculators</span>
      </div>

      {/* 🔹 Sidebar */}
      <div
        style={{
          ...styles.navbar,
          left: isOpen ? "0" : "-240px",
        }}
      >
        <button
          style={getLinkStyle("nos")}
          onClick={() => handleNavigation("nos")}
        >
          NOS Calculator
        </button>

        <button
          style={getLinkStyle("intersection")}
          onClick={() => handleNavigation("intersection")}
        >
          Intersection Calculator
        </button>

        <button
          style={getLinkStyle("pythagoras")}
          onClick={() => handleNavigation("pythagoras")}
        >
          Pythagoras Calculator
        </button>
      </div>

      {/* 🔹 Overlay */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

const styles = {
  topbar: {
    height: "60px",
    background: "#1e1e2f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    padding: "0 15px",
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 1000,
  },
  burger: {
    fontSize: "22px",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    marginRight: "10px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  navbar: {
    position: "fixed",
    top: "60px",
    left: "0",
    width: "220px",
    height: "100vh",
    background: "#1e1e2f",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxSizing: "border-box",
    transition: "left 0.3s ease",
    zIndex: 1001,
  },
  link: {
    background: "transparent",
    border: "none",
    color: "#fff",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "10px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
};

export default Navbar;