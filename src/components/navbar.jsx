import React, { useState } from "react";
import ReactGA from "react-ga4";

function Navbar({ setPage, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (page) => {
    setPage(page);
    setIsOpen(false);
    ReactGA.event({
      category: "Navigation",
      action: page + "Navigation",
    });
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
            style={getLinkStyle("unevenshapes")}
            onClick={() => handleNavigation("unevenshapes")}
          >
            Area of Uneven Shapes
          </button>

          <button
            style={getLinkStyle("pythagoras")}
            onClick={() => handleNavigation("pythagoras")}
          >
            Pythagoras Calculation
          </button>

          <button
            style={getLinkStyle("nos")}
            onClick={() => handleNavigation("nos")}
          >
            NOS Calculation
          </button>

          <button
            style={getLinkStyle("intersection")}
            onClick={() => handleNavigation("intersection")}
          >
            Intersection Calculation
          </button>

          <button
            style={getLinkStyle("fline")}
            onClick={() => handleNavigation("fline")}
          >
            F Line Statement
          </button>
        </div>

        <div style={styles.footerItems}>
          <button 
            // style={getLinkStyle("help")}
            style={{display:'none'}}
            onClick={() => handleNavigation("help")}
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
    width: "100%",
    top: 0,
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
    marginBottom: "80px", // Pushed up due to topbar offset
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
