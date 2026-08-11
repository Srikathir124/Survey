import React, { useEffect, useRef, useState } from "react";

export default function FileNameModal({
  isOpen,
  title,
  defaultName = "",
  extension = ".pdf",
  onConfirm,
  onCancel,
}) {
  const [fileName, setFileName] = useState(defaultName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setFileName(defaultName || "");
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleDownload = () => {
    let name = fileName.trim();

    if (!name) {
      alert("Please enter a file name.");
      return;
    }

    onConfirm(name.replace(/[\\/:*?"<>|]/g, ""));
  };

  return (
    <div className="fnm-overlay">
      <div className="fnm-modal">
        <label>Enter Your File Name</label>

        <button
          className="fnm-close"
          onClick={onCancel}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="fnm-input-row">
          <input
            ref={inputRef}
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleDownload();
              if (e.key === "Escape") onCancel();
            }}
          />
          <span>{extension}</span>
        </div>

        <div className="fnm-buttons">
          <button className="fnm-download" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>

      <style>{`
        .fnm-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, .45);
        }

        .fnm-modal {
          position: relative;
          width: 420px;
          max-width: 90%;
          padding: 24px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, .25);
        }

        .fnm-modal label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .fnm-input-row {
          display: flex;
          align-items: center;
        }

        .fnm-input-row input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px 0 0 6px;
          font-size: 15px;
          outline: none;
        }

        .fnm-input-row input:focus {
          border-color: #2563eb;
        }

        .fnm-input-row span {
          padding: 10px 14px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-left: none;
          border-radius: 0 6px 6px 0;
          font-weight: bold;
        }

        .fnm-buttons {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .fnm-download {
          padding: 10px 18px;
          border: none;
          border-radius: 6px;
          background: #2563eb;
          color: #fff;
          cursor: pointer;
          font-weight: 600;
        }

        .fnm-download:hover {
          background: #1d4ed8;
        }

        .fnm-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #dc2626;
          font-size: 28px;
          font-weight: bold;
          line-height: 1;
          transition: all .2s ease;
        }

        .fnm-close:active {
          background: #fecaca;
        }
      `}</style>
    </div>
  );
}