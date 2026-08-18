import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { trackPageView } from "../utils/analytics.js";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
    trackPageView(path);
  };

  const getLinkStyle = (path) => ({
    ...styles.link,
    backgroundColor: location.pathname === path ? "#2e2e48" : "transparent",
    fontWeight: location.pathname === path ? "bold" : "normal",
    borderRadius: "6px",
    padding: "10px",
  });

  return (
    <>
      {/* 🔹 Top Bar */}
      <div style={styles.topbar}>
        <button style={styles.burger} onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        <span style={styles.heading}>Surveyor Works</span>
      </div>

      {/* 🔹 Sidebar */}
      <div
        style={{
          ...styles.navbar,
          left: isOpen ? "0" : "-240px",
        }}
      >
        <div style={styles.menuItems}>
          <button
            style={getLinkStyle("/unevenshapes")}
            onClick={() => handleNavigation("/unevenshapes")}
          >
            Area of Uneven Shapes
          </button>

          <button
            style={getLinkStyle("/pythagoras")}
            onClick={() => handleNavigation("/pythagoras")}
          >
            Pythagoras Calculation
          </button>

          <button
            style={getLinkStyle("/nos")}
            onClick={() => handleNavigation("/nos")}
          >
            NOS Calculation
          </button>

          <button
            style={getLinkStyle("/intersection")}
            onClick={() => handleNavigation("/intersection")}
          >
            Intersection Calculation
          </button>
          
          <button
            style={getLinkStyle("/fline-statement")}
            onClick={() => handleNavigation("/fline-statement")}
          >
            F Line Statement
          </button>
          
          <button
            style={getLinkStyle("/fline-summon")}
            onClick={() => handleNavigation("/fline-summon")}
          >
            F Line Summon
          </button>
          
          <button
            style={getLinkStyle("/a-reg-correction")}
            onClick={() => handleNavigation("/a-reg-correction")}
          >
            A-Reg Correction Form
          </button>
          
          <button
            style={getLinkStyle("/conversion-quiz")}
            onClick={() => handleNavigation("/conversion-quiz")}
          >
            Practice Quiz
          </button>
          
          <button
            style={{ display: "none" }}
            onClick={() => handleNavigation("/departmental-exam")}
          >
            Departmental Exam
          </button>

          {/* Surveyor Profiles */}
          {/* Area Mismatch Statement */}
          {/* G Line Conversion */}
          {/* Q & A */}
        </div>

        <div style={styles.footerItems}>
          <button
            style={{ display: "none" }}
            onClick={() => handleNavigation("/help")}
          >
            Facing Issues?
          </button>
        </div>
      </div>

      {/* 🔹 Overlay */}
      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}
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
      justifyContent: "space-between",
      padding: "0 15px",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      width: "100%",
      boxSizing: "border-box",
      zIndex: 10000,
    },
  burger: {
    fontSize: "22px",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "bold",
    marginLeft: "10px",
    flex: 1,
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
    zIndex: 10002,
    justifyContent: "space-between",
  },
  menuItems: {
    display: "flex",
    flexDirection: "column",
  },
  footerItems: {
    marginBottom: "80px",
  },
  link: {
    background: "transparent",
    border: "none",
    color: "#fff",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    zIndex: 10001,
  },
};

export default Navbar;