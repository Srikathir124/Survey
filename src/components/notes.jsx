import React, { useState, useEffect } from "react";

function NotesPanel() {
  // HIDDEN ON INITIAL LOAD AS REQUESTED
  const [panel, setPanel] = useState("hidden");
  const [noteText, setNoteText] = useState("");
  const [notesList, setNotesList] = useState(() => {
    const saved = localStorage.getItem("panel_notes");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync notes to localstorage
  useEffect(() => {
    localStorage.setItem("panel_notes", JSON.stringify(notesList));
  }, [notesList]);

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const newNote = {
      id: Date.now(),
      text: noteText,
      date: new Date().toLocaleDateString(),
    };
    setNotesList([newNote, ...notesList]);
    setNoteText("");
  };

  const handleDeleteNote = (id) => {
    setNotesList(notesList.filter((note) => note.id !== id));
  };

  return (
    <>
      {/* OPEN BUTTON MOVED TO THE LEFT EDGE */}
      {panel === "hidden" && (
        <button className="open-arrow" onClick={() => setPanel("partial")}>
          ▶
        </button>
      )}

      {/* PANEL SLIDING FROM THE LEFT */}
      {panel !== "hidden" && (
        <div className={`notes-panel ${panel}`}>

          {/* TOOLBAR */}
          <div className="toolbar">
            {panel === "full" ? (
              <button onClick={() => setPanel("partial")}>¾</button>
            ) : (
              <button onClick={() => setPanel("full")}>⛶</button>
            )}
            <button onClick={() => setPanel("hidden")}>✕</button>
          </div>

          <div className="content">
            
            {/* ================= NOTE CREATOR ================= */}
            <div className={`creatorCard ${panel}`}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type a new note here..."
                rows={panel === "full" ? 6 : 4}
              />
              <button className="saveBtn" onClick={handleSaveNote}>
                Save Note
              </button>
            </div>

            {/* ================= NOTES LIST DISPLAY ================= */}
            <div className="notes-section">
              <h3>Saved Notes ({notesList.length})</h3>
              
              {notesList.length === 0 ? (
                <div className="empty-state">No notes saved yet.</div>
              ) : (
                <div className={`notes-grid ${panel}`}>
                  {notesList.map((note) => (
                    <div key={note.id} className="note-card">
                      <div className="note-header">
                        <span className="note-date">{note.date}</span>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <p className="note-body">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .notes-panel {
          position: fixed;
          left: 0; /* Positioned on the left side */
          top: 70px;
          height: calc(100vh - 70px);
          background: #ffffff;
          z-index: 9999;
          box-shadow: 5px 0 20px rgba(0,0,0,.25); /* Flipped shadow rightward */
          overflow-y: auto;
          overflow-x: hidden;
          transition: 0.3s ease;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .notes-panel.partial {
          width: 75vw;
        }

        .notes-panel.full {
          width: 100vw;
        }

        .toolbar {
          display: flex;
          gap: 4px;
          padding: 6px;
          background: #f1f5f9;
        }

        .toolbar button {
          flex: 1;
          height: 36px;
          border: none;
          background: #2563eb;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        /* OPEN ARROW ANCHORED ON LEFT EDGE */
        .open-arrow {
          position: fixed;
          left: 0;
          top: 50%;
          width: 50px;
          height: 70px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0 10px 10px 0; /* Rounded right corners */
          font-size: 20px;
          cursor: pointer;
          z-index: 9999;
        }

        .content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ===== NOTE CREATOR ===== */
        .creatorCard {
          background: #f8fafc;
          padding: 16px;
          border-radius: 14px;
          box-shadow: inset 0 0 0 1px #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .creatorCard.full {
          padding: 24px;
        }

        textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          resize: vertical;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }

        textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
        }

        .creatorCard.full textarea {
          font-size: 16px;
        }

        .saveBtn {
          align-self: flex-end;
          padding: 10px 20px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .saveBtn:hover {
          background: #1d4ed8;
        }

        /* ===== NOTES GRID DISPLAYS ===== */
        .notes-section h3 {
          margin: 0 0 14px 0;
          color: #1e293b;
          font-size: 18px;
        }

        .empty-state {
          color: #64748b;
          font-style: italic;
          padding: 20px 0;
        }

        .notes-grid {
          display: grid;
          gap: 16px;
        }

        .notes-grid.partial {
          grid-template-columns: repeat(2, 1fr);
        }

        .notes-grid.full {
          grid-template-columns: repeat(4, 1fr);
        }

        .note-card {
          background: #fffdf5;
          border: 1px solid #fef08a;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 8px;
          word-break: break-word;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #fef9c3;
          padding-bottom: 6px;
          gap: 8px;
        }

        .note-date {
          font-size: 11px;
          color: #71717a;
          font-weight: 500;
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .delete-btn:hover {
          background: #fee2e2;
        }

        .note-body {
          margin: 0;
          font-size: 13px;
          color: #334155;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        /* ===== MOBILE FALLBACKS ===== */
        @media (max-width: 768px) {
          .notes-panel.partial {
            width: 75vw;
          }
          .notes-grid.partial, .notes-grid.full {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default NotesPanel;