import React, { useState } from 'react';
import FileNameModal from "./FileNameModal";
import { trackEvent } from "../../utils/analytics.js";

// EditableSpan for inline header/body text
const EditableSpan = ({ value, onChange, minWidth = "40px" }) => (
  <span
    className="editable-span"
    style={{ minWidth }}
    contentEditable
    suppressContentEditableWarning
    onBlur={(e) => onChange(e.target.innerText)}
  >
    {value || ''}
  </span>
);

// TableBlock with horizontal scroll container and responsive cell inputs
const TableBlock = ({ rows, setRows, handleCellChange, addRow, removeRow }) => (
  <div className="table-scroll-container">
    <div className="table-scroll-hint no-print">↔ அட்டவணையை பக்கவாட்டில் நகர்த்தவும் (Swipe to view table)</div>
    <table className="pdf-table">
      <thead>
        <tr>
          <th colSpan="6" className="th-group">பழைய</th>
          <th colSpan="6" className="th-group">திருத்தம்</th>
          <th rowSpan="2" className="th-vertical">
            <div className="vertical-text">ஆவணங்கள் திருத்தப்பட வேண்டிய</div>
          </th>
          <th rowSpan="2" className="no-print">செயல்</th>
        </tr>
        <tr>
          <th className="th-vertical"><div className="vertical-text">புலஎண்</div></th>
          <th className="th-vertical"><div className="vertical-text">உட்பிரிவு எண் அல்லது எழுத்து</div></th>
          <th className="th-vertical"><div className="vertical-text">குடிமுறை அல்லது புறம்போக்கு</div></th>
          <th className="th-vertical"><div className="vertical-text">ஹெக்டேர் ஒன்றுக்கு வீதம்</div></th>
          <th className="th-vertical"><div className="vertical-text">பரப்பளவு</div></th>
          <th className="th-vertical"><div className="vertical-text">தீர்வை</div></th>
          
          <th className="th-vertical"><div className="vertical-text">புலஎண்</div></th>
          <th className="th-vertical"><div className="vertical-text">உட்பிரிவு எண் அல்லது எழுத்து</div></th>
          <th className="th-vertical"><div className="vertical-text">குடிமுறை அல்லது புறம்போக்கு</div></th>
          <th className="th-vertical"><div className="vertical-text">ஹெக்டேர் ஒன்றுக்கு வீதம்</div></th>
          <th className="th-vertical"><div className="vertical-text">பரப்பளவு</div></th>
          <th className="th-vertical"><div className="vertical-text">தீர்வை</div></th>
        </tr>
        <tr className="col-numbers-row">
          <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
          <td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td>
          <td className="no-print"></td>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13'].map((colKey) => (
              <td key={colKey}>
                <textarea
                  rows={1}
                  value={row[colKey]}
                  onChange={(e) => {
                    handleCellChange(rows, setRows, index, colKey, e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
              </td>
            ))}
            <td className="no-print text-center">
              {rows.length > 1 && (
                <button className="del-btn" onClick={() => removeRow(rows, setRows, index)}>✕</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="no-print margin-top-5">
      <button className="add-row-btn" onClick={() => addRow(rows, setRows)}>+ வரிசை சேர்க்க</button>
    </div>
  </div>
);

export default function AreaCorrection() {
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [sonOf, setSonOf] = useState('');
  const [pattaNo, setPattaNo] = useState('');
  const [toPerson, setToPerson] = useState('');
  const [docRef, setDocRef] = useState('');
  const [district, setDistrict] = useState('');
  const [middleTaluk, setMiddleTaluk] = useState('');
  const [middleVillage, setMiddleVillage] = useState('');

  const [p2District, setP2District] = useState('');
  const [p2Taluk, setP2Taluk] = useState('');
  const [p2Village, setP2Village] = useState('');

  const [showFileNameModal, setShowFileNameModal] = useState(false);

  const createEmptyRow = () => ({
    c1: '', c2: '', c3: '', c4: '', c5: '', c6: '',
    c7: '', c8: '', c9: '', c10: '', c11: '', c12: '', c13: ''
  });

  const [page1Rows, setPage1Rows] = useState([createEmptyRow()]);
  const [page2Rows, setPage2Rows] = useState([createEmptyRow()]);

  const handleCellChange = (rows, setRows, index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = (rows, setRows) => setRows([...rows, createEmptyRow()]);
  const removeRow = (rows, setRows, index) => {
    if (rows.length > 1) setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="area-correction-container">
      {/* Top Action Controls */}
      <div className="no-print controls-card">
        <button onClick={() => setShowFileNameModal(true)} className="download-pdf-btn">
          Download PDF
        </button>
      </div>

      <div className="printable-document">
        {/* PAGE 1 */}
        <div className="a4-page page-1">
          <div className="doc-header">
            <div className="font-bold">பின் இணைப்பு XIV</div>
            <div>(இயல் 11 பத்தி 7)</div>
            <div className="font-bold underline text-lg">அறிவிப்பு</div>
          </div>

          <div className="inline-form-fields margin-top-10">
            <EditableSpan value={taluk} onChange={setTaluk} minWidth="60px" /> வட்டம்{' '}
            <EditableSpan value={village} onChange={setVillage} minWidth="70px" /> கிராமத்திலிருக்கும்{' '}
            <EditableSpan value={sonOf} onChange={setSonOf} minWidth="60px" /> மகன்{' '}
            <EditableSpan value={pattaNo} onChange={setPattaNo} minWidth="50px" /> எண் பட்டாதாரர்{' '}
            <EditableSpan value={toPerson} onChange={setToPerson} minWidth="70px" /> க்கு{' '}
            <EditableSpan value={docRef} onChange={setDocRef} minWidth="50px" /> தில் இணைக்கப்பட்ட அட்டவணையில் கண்ட மாறுதல் அவசியமாகக் காணப்படுகிறதென்றும் கிராமக் கணக்குகளில் மாறுதல் செய்ய உத்தேசிக்கப்பட்டிருக்கிறதென்றும் இதன்மூலம் அறிவிக்கப்படுகிறது உத்தேச மாறுதலுக்கு மறுப்பு எதுமிருந்தால் இந்த அறிவிப்பை பெற்ற 15 நாட்களுக்குள் அடியிற் கையொப்பமிட்டிருப்பவரிடம் தாக்கல் செய்ய அந்தக்கால வரம்புக்குள் தகவல் கிடைக்கவில்லை என்றால் உத்தேச மாறுதல்கள் ஏற்றுக்கொண்டதாக கருதப்படும்.
          </div>

          <div className="inline-location-line margin-top-10">
            <EditableSpan value={district} onChange={setDistrict} minWidth="60px" /> மாவட்டம்,{' '}
            <EditableSpan value={middleTaluk} onChange={setMiddleTaluk} minWidth="60px" /> வட்டம்{' '}
            <EditableSpan value={middleVillage} onChange={setMiddleVillage} minWidth="70px" /> கிராமத்தில் செய்யப்பட வேண்டிய மாறுதல்கள் குறிப்பு
          </div>

          <div className="margin-top-10">
            <TableBlock 
              rows={page1Rows} 
              setRows={setPage1Rows} 
              handleCellChange={handleCellChange}
              addRow={addRow}
              removeRow={removeRow}
            />
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="a4-page page-2">
          <div className="doc-header">
            <div className="font-bold">பின் இணைப்பு XIV</div>
            <div>(இயல் 11 பத்தி 7)</div>
            <div className="font-bold underline text-lg">அறிவிப்பு</div>
          </div>

          <div className="flex-between margin-top-10 font-bold flex-wrap">
            <div>மாவட்டம் : <EditableSpan value={p2District} onChange={setP2District} minWidth="80px" /></div>
            <div>வட்டம் : <EditableSpan value={p2Taluk} onChange={setP2Taluk} minWidth="80px" /></div>
          </div>

          <div className="text-center font-bold underline margin-top-10">
            <EditableSpan value={p2Village} onChange={setP2Village} minWidth="80px" /> கிராமத்தில் பரப்பளவில் செய்ய வேண்டிய மாறுதல் குறிப்பு
          </div>

          <div className="margin-top-10">
            <TableBlock 
              rows={page2Rows} 
              setRows={setPage2Rows} 
              handleCellChange={handleCellChange}
              addRow={addRow}
              removeRow={removeRow}
            />
          </div>
        </div>
      </div>

      <FileNameModal
        isOpen={showFileNameModal}
        title="Download PDF"
        defaultName={`Area Correction ${pattaNo || village}`}
        extension=".pdf"
        onCancel={() => setShowFileNameModal(false)}
        onConfirm={(fileName) => {
          setShowFileNameModal(false);
          if (window.AndroidPrinter && window.AndroidPrinter.printPage) {
            window.AndroidPrinter.printPage(fileName);
          } else {
            const originalTitle = document.title;
            document.title = fileName;
            window.print();
            document.title = originalTitle;
          }
          trackEvent("pdf_generated", { document_name: fileName });
        }}
      />

      <style>{`
        .area-correction-container {
          font-family: 'Times New Roman', serif;
          background: #f1f5f9;
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          padding: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .controls-card {
          width: 100%;
          max-width: 750px;
          background: #ffffff;
          padding: 8px 10px;
          margin-bottom: 8px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          box-sizing: border-box;
        }
        .download-pdf-btn {
          width: 100%;
          background: #2563eb;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
        }
        .add-row-btn {
          background: #059669;
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
          margin-top: 4px;
        }
        .printable-document {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .a4-page {
          background: white;
          width: 100%;
          max-width: 750px;
          min-height: auto;
          padding: 10px 8px;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          color: #000;
          font-size: 12px;
          line-height: 1.6;
        }
        .doc-header {
          text-align: center;
          line-height: 1.3;
        }
        .font-bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .text-lg { font-size: 14px; }
        .text-center { text-align: center; }
        .flex-between { display: flex; justify-content: space-between; gap: 8px; }
        .flex-wrap { flex-wrap: wrap; }
        .margin-top-5 { margin-top: 4px; }
        .margin-top-10 { margin-top: 8px; }

        .inline-form-fields, .inline-location-line {
          text-align: justify;
          word-break: break-word;
        }

        .editable-span {
          border-bottom: 1px dotted #000;
          display: inline-block;
          text-align: center;
          font-weight: bold;
          padding: 0 2px;
          background: #f8fafc;
          word-break: break-word;
          min-width: 40px;
        }

        /* Mobile-Friendly Table Wrapper with Horizontal Scroll */
        .table-scroll-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-top: 6px;
          padding-bottom: 4px;
        }
        .table-scroll-hint {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 4px;
          text-align: center;
          font-style: italic;
        }
        .pdf-table {
          width: 100%;
          min-width: 650px; /* Ensures columns stay legible while scrolling */
          border-collapse: collapse;
          border: 1px solid #000;
          font-size: 10.5px;
          text-align: center;
          table-layout: fixed;
          background: #fff;
        }
        .pdf-table th, .pdf-table td {
          border: 1px solid #000;
          padding: 2px 1px;
          vertical-align: middle;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .th-group {
          font-weight: bold;
          font-size: 11px;
        }
        .col-numbers-row td {
          font-weight: bold;
          font-size: 9px;
        }
        .th-vertical {
          height: 100px;
          vertical-align: bottom;
          padding-bottom: 4px;
        }
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          margin: 0 auto;
          font-size: 10.5px;
          font-weight: bold;
        }
        .pdf-table textarea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          text-align: center;
          font-size: 10.5px;
          font-family: inherit;
          color: #000;
          resize: none;
          overflow: hidden;
          white-space: pre-wrap;
          word-break: break-word;
          box-sizing: border-box;
          padding: 2px 0;
          min-height: 18px;
          line-height: 1.2;
        }
        .del-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          padding: 1px 4px;
          font-size: 10px;
        }

        /* PRINT STYLES - Strict A4 Dimensions & Formatting */
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 10mm; /* Let @page handle margins instead of padding */
            }

            html, body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important; /* Remove fixed 297mm height */
            }

            body * {
              visibility: hidden !important;
            }

            .printable-document,
            .printable-document * {
              visibility: visible !important;
            }

            .printable-document {
              position: static !important; /* Static avoids absolute coordinate overflow */
              width: 100% !important;
              display: block !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .a4-page {
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: 0 !important; /* Remove min-height: 297mm to prevent overflow push */
              height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
              font-size: 12px !important;
              line-height: 1.5 !important;
              box-sizing: border-box !important;
            }

            .page-1 {
              break-after: page !important;
              page-break-after: always !important;
            }

            .page-2 {
              break-after: auto !important;
              page-break-after: auto !important;
            }

            .table-scroll-container {
              overflow: visible !important;
              width: 100% !important;
            }

            .pdf-table {
              min-width: 100% !important;
              width: 100% !important;
              font-size: 10.5px !important;
              table-layout: fixed !important;
            }

            .th-vertical {
              height: 90px !important;
            }

            .vertical-text {
              font-size: 10px !important;
            }

            .no-print, .table-scroll-hint {
              display: none !important;
            }

            .editable-span {
              border-bottom: none !important;
              background: transparent !important;
            }

            .pdf-table textarea {
              border: none !important;
              resize: none !important;
              font-size: 10.5px !important;
              overflow: hidden !important;
            }
          }
        
      `}</style>
    </div>
  );
}