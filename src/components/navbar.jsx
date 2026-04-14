import React, { useState, useRef, useEffect } from "react";

function Navbar({ setPage, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  // 🔹 Close profile when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        {/* 🔹 Profile Section */}
        <div style={styles.profileContainer} ref={profileRef}>
          <div
            style={styles.profileIcon}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            SK
          </div>

          {profileOpen && (
            <div style={styles.profileDropdown}>
              <div style={styles.profileName}>Sri Kathiravan</div>
              <div style={styles.profileSub}>Field Surveyor</div>
              <div style={styles.profileSub}>Kallakurichi</div>
            </div>
          )}
        </div>
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
    justifyContent: "space-between",
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
  },
  heading: {
    fontSize: "18px",
    fontWeight: "bold",
    marginLeft: "10px",
    flex: 1,
  },

  // 🔹 Profile styles
  profileContainer: {
    position: "relative",
    marginRight: "30px", // 👈 pushes it slightly left
  },
  profileIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#4CAF50", // bright green (high contrast)
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  },
  profileDropdown: {
    position: "absolute",
    right: 0,
    top: "40px",
    background: "#fff",
    color: "#000",
    borderRadius: "8px",
    padding: "10px",
    minWidth: "180px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  profileName: {
    fontWeight: "bold",
    marginBottom: "5px",
  },
  profileSub: {
    fontSize: "14px",
    color: "#555",
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