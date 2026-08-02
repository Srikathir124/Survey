// DepartmentalExam.jsx

import React, { useState } from "react";
import ReactGA from "react-ga4";

function DepartmentalExam({ setPage }) {
  const [view, setView] = useState("home");

  const books = [
    {
      title: "நில அளவர் / வரைவாளர் கையேடு",
      link: "https://drive.google.com/file/d/15g6Qd5aMxKBpgTHJ_g50W04mz6M9wTLw/view?usp=drive_link",
    },
  ];

  const papers = [
    { title: "FS Paper-1", link: "https://drive.google.com/file/d/1lmYc1h7PlnI-G7vfe04b2l6Aoa0SPsI_/view?usp=drive_link" },
    { title: "FS Paper-2", link: "https://drive.google.com/file/d/1FVBQeJTAav0VBpJGZRvWummCaFPRGkY_/view?usp=drive_link" },
    { title: "SIS Paper-1", link: "https://drive.google.com/file/d/1wl6FJXJ0nIxxBh--BtQa2CAmuU4FIJE1/view?usp=drive_link" },
    { title: "SIS Paper-2", link: "https://drive.google.com/file/d/1vpUbIO7TemFZsOOVCGI8wQfXlqFq6QLD/view?usp=drive_link" },
    { title: "HS Paper-1", link: "https://drive.google.com/file/d/195B2YDIADId18Teslvh35R60ZryXwBGN/view?usp=drive_link" },
    { title: "HS Paper-2", link: "https://drive.google.com/file/d/1aRwhfOB8SdYOHIzOlvuMIbWLgJa0iHQG/view?usp=drive_link" },
  ];

  const renderList = (title, items) => (
    <>
      <button
        className="back-button"
        onClick={() => setView("home")}
      >
        ← Back
      </button>

      <h2 className="page-title">{title}</h2>

      <div className="list-container">
        {items.map((item, index) => (
          <div
            key={index}
            className="list-card"
            onClick={() => window.open(item.link, "_blank")}
          >
            {item.title}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="department-container">

      {view === "home" && (
        <>
          <div className="card-grid">

            <div
              className="menu-card"
              onClick={() => {
                setView("books"); 
                ReactGA.event({
                  category: "Navigation",
                  action: "View Books",
                });
              }}
            >
              <div className="card-icon">📖</div>
              <div className="card-heading">Books</div>
            </div>

            <div
              className="menu-card"
              onClick={() => {
                setView("papers");
                ReactGA.event({
                  category: "Navigation",
                  action: "View Previous Year Questions",
                });
              }}
            >
              <div className="card-icon">📄</div>
              <div className="card-heading">
                Previous Year Question Paper
              </div>
            </div>

            <div
              className="menu-card"
              onClick={() => {
                setPage("conversion-quiz");
                ReactGA.event({
                  category: "Navigation",
                  action: "View Conversion Quiz",
                });
              }}
            >
              <div className="card-icon">📝</div>
              <div className="card-heading">Quiz</div>
            </div>

          </div>
        </>
      )}

      {view === "books" &&
        renderList("Books", books)}

      {view === "papers" &&
        renderList("Previous Year Question Paper", papers)}

      <style>{`

        .department-container{
          max-width:800px;
          margin:auto;
          padding:24px;
          font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
        }

        .header-icon{
          text-align:center;
          font-size:42px;
          margin-bottom:8px;
        }

        .page-title{
          text-align:center;
          margin-bottom:30px;
          color:#1f2937;
        }

        .card-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
          gap:20px;
        }

        .menu-card{
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:28px 20px;
          text-align:center;
          cursor:pointer;
          transition:all .25s ease;
          box-shadow:0 3px 10px rgba(0,0,0,.05);
        }

        .menu-card:hover{
          transform:translateY(-5px);
          border-color:#2563eb;
          box-shadow:0 10px 25px rgba(37,99,235,.12);
        }

        .card-icon{
          font-size:42px;
          margin-bottom:15px;
        }

        .card-heading{
          font-size:17px;
          font-weight:600;
          color:#374151;
        }

        .back-button{
          background:#2563eb;
          color:#fff;
          border:none;
          padding:10px 18px;
          border-radius:8px;
          cursor:pointer;
          margin-bottom:20px;
          font-size:14px;
        }

        .back-button:hover{
          background:#1d4ed8;
        }

        .list-container{
          display:flex;
          flex-direction:column;
          gap:15px;
          margin-top:20px;
        }

        .list-card{
          padding:18px 20px;
          border:1px solid #e5e7eb;
          border-radius:10px;
          background:#fff;
          cursor:pointer;
          transition:all .2s ease;
          font-size:16px;
          font-weight:500;
          color:#374151;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }

        .list-card:hover{
          background:#eff6ff;
          border-color:#2563eb;
          transform:translateX(5px);
        }

        @media (max-width:600px){

          .department-container{
            padding:15px;
          }

          .card-grid{
            grid-template-columns:1fr;
          }

        }

      `}</style>

    </div>
  );
}

export default DepartmentalExam;