import React, { useState } from 'react';
import FileNameModal from "./FileNameModal";
import { trackEvent } from "../../utils/analytics.js";

// EditableSpan for inline header/body text
const EditableSpan = ({ value, onChange, minWidth = "40px", className = "" }) => (
  <span
    className={`editable-span ${className}`}
    style={{ minWidth }}
    contentEditable
    suppressContentEditableWarning
    onBlur={(e) => onChange(e.target.innerText.trim())}
  >
    {value || ''}
  </span>
);

export default function SummonStatement() {
  const [talukOffice, setTalukOffice] = useState('வட்டாட்சியர் அலுவலகம்,');
  const [flNo, setFlNo] = useState('');
  const [date, setDate] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [surveyNo, setSurveyNo] = useState('');
  const [hearingDate, setHearingDate] = useState('');
  const [hearingSession, setHearingSession] = useState('முற்பகல்');
  const [hearingTime, setHearingTime] = useState('09:30');
  const [venue, setVenue] = useState('கிராம நிர்வாக அலுவலகத்தில்');
  const [authorityTitle, setAuthorityTitle] = useState('வட்டாட்சியருக்காக');
  const [authority, setAuthority] = useState('');
  const [recipient, setRecipient] = useState(
    'திரு.\nத/பெ.\nகிராமம்,\nவட்டம்.'
  );
  const [policeStation, setPoliceStation] = useState('காவல் ஆய்வாளர், ');

  const [showFileNameModal, setShowFileNameModal] = useState(false);

  return (
    <div className="summon-container-root">
      {/* Top Action Controls */}
      <div className="no-print controls-card">
        <button onClick={() => setShowFileNameModal(true)} className="download-pdf-btn">
          Download PDF
        </button>
      </div>

      <div className="printable-document">
        <div className="a4-page page-1">
          {/* Header - Right-aligned Office and Location */}
          <div className="doc-header-right font-bold text-right">
            <div>
              <EditableSpan value={talukOffice} onChange={setTalukOffice} minWidth="140px" />
            </div>
            <div className="margin-top-5">
              <EditableSpan value={taluk} onChange={setTaluk} minWidth="110px" />
            </div>
          </div>

          {/* Title - Center */}
          <div className="text-center margin-top-10">
            <div className="font-bold underline text-lg">அழைப்பாணை கடிதம்</div>
          </div>

          {/* Reference & Date Line */}
          <div className="flex-between margin-top-10 font-bold flex-wrap">
            <div>
              பார்வை: FL No.: <EditableSpan value={flNo} onChange={setFlNo} minWidth="80px" />
            </div>
            <div>
              நாள்: <EditableSpan value={date} onChange={setDate} minWidth="80px" />
            </div>
          </div>

          {/* Body Paragraph */}
          <div className="inline-form-fields margin-top-10">
            <EditableSpan value={taluk} onChange={setTaluk} minWidth="70px" /> வட்டம்,{' '}
            <EditableSpan value={village} onChange={setVillage} minWidth="70px" /> கிராமத்தில் வசிக்கும் திரு.{' '}
            <EditableSpan value={applicantName} onChange={setApplicantName} minWidth="90px" /> என்பவர் கிராம புல எண்{' '}
            <EditableSpan value={surveyNo} onChange={setSurveyNo} minWidth="50px" /> -இல் அளந்து அத்துகாட்டுதல் தொடர்பான மனு மீது விசாரணை மற்றும் அளவைப் பணி செய்ய இருப்பதனால்{' '}
            <EditableSpan value={hearingDate} onChange={setHearingDate} minWidth="70px" /> அன்று{' '}
            <select
              value={hearingSession}
              onChange={(e) => setHearingSession(e.target.value)}
              className="editable-select"
            >
              <option value="முற்பகல்">முற்பகல்</option>
              <option value="பிற்பகல்">பிற்பகல்</option>
            </select>{' '}
            <EditableSpan value={hearingTime} onChange={setHearingTime} minWidth="40px" /> மணியளவில்{' '}
            <EditableSpan value={venue} onChange={setVenue} minWidth="120px" /> மனுதாரர் மற்றும் பக்கத்து நில உடைமையாளர் என்ற வகையில் தங்களை விசாரணைக்கு நேரில் ஆஜராகுமாறும், தங்கள் மனுவின் மீதான விசாரணையின் போது தங்களிடம் உள்ள கிரையம் / தானம் / உயில் / பவர் / பாகப் பத்திரம், நீதிமன்ற உத்தரவுகள் மற்றும் மூல ஆவணங்களுடன் ஆஜராகுமாறு கேட்டுக் கொள்ளப்படுகிறது. அவ்வாறு தவறும் பட்சத்தில் சமர்ப்பிக்கப்பட்டுள்ள ஆவணங்கள் அடிப்படையில் மேல் நடவடிக்கைக்கு பரிந்துரை செய்யப்படும் என்பதைத் தெரிவிக்கப்படுகிறது.
          </div>

          {/* Authority Signatory */}
          <div className="text-right margin-top-20 font-bold">
            <div className="sig-space"></div>
            <div>
              <EditableSpan value={authorityTitle} onChange={setAuthorityTitle} minWidth="110px" />
            </div>
            <div className="margin-top-5">
              <EditableSpan value={authority} onChange={setAuthority} minWidth="80px" />
            </div>
          </div>

          {/* Recipient */}
          <div className="margin-top-10">
            <div className="font-bold">பெறுநர்:</div>
            <div
              className="editable-span recipient-box"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setRecipient(e.target.innerText.trim())}
            >
              {recipient}
            </div>
          </div>

          {/* Copies Section (நகல்) */}
          <div className="margin-top-10 copy-section">
            <div className="margin-top-5">
              <span className="font-bold">நகல்: </span>
              <EditableSpan value={policeStation} onChange={setPoliceStation} minWidth="150px" />
              <div className="copy-subtext">
                (சட்டம் ஒழுங்கு பிரச்சனை தொடர்பான பாதுகாப்பு வழங்கும் பொருட்டு)
              </div>
            </div>
            <div className="margin-top-5">
              <div className="font-bold">
                நகல்: கிராம நிர்வாக அலுவலர், கிராமக் கணக்குகளுடன் விசாரணைக்கு ஆஜரில் இருக்கும்படியும்,
              </div>
              <div className="copy-subtext">
                (சார்வு நகல் சார்வு செய்து மீள அனுப்பி வைக்கத் தெரிவிக்கப்படுகிறது)
              </div>
            </div>
          </div>
        </div>
      </div>

      <FileNameModal
        isOpen={showFileNameModal}
        title="Download PDF"
        defaultName={`Summon Format ${surveyNo || village}`}
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
          trackEvent("Summon_pdf_generated", { document_name: fileName });
        }}
      />

      <style>{`
        .summon-container-root {
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
          padding: 16px 14px;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          color: #000;
          font-size: 12px;
          line-height: 1.7;
        }
        .doc-header-right {
          text-align: right;
          line-height: 1.4;
          width: 100%;
        }
        .font-bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .text-lg { font-size: 14px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .flex-between { display: flex; justify-content: space-between; gap: 8px; }
        .flex-wrap { flex-wrap: wrap; }
        .margin-top-5 { margin-top: 4px; }
        .margin-top-10 { margin-top: 8px; }
        .margin-top-20 { margin-top: 16px; }

        .inline-form-fields {
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
          outline: none;
        }

        .editable-select {
          border: none;
          border-bottom: 1px dotted #000;
          font-weight: bold;
          background: #f8fafc;
          font-family: inherit;
          font-size: 11.5px;
          outline: none;
          cursor: pointer;
        }

        .sig-space {
          height: 35px;
        }

        .recipient-box {
          text-align: left;
          min-width: 180px;
          white-space: pre-wrap;
          line-height: 1.4;
          margin-top: 2px;
        }

        .copy-section {
          border-top: 1px dashed #cbd5e1;
          padding-top: 6px;
        }
        .copy-subtext {
          font-size: 10.5px;
          color: #334155;
          padding-left: 12px;
        }

        /* PRINT STYLES - Strict A4 Dimensions & Formatting */
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }

          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }

          body * {
            visibility: hidden !important;
          }

          .printable-document,
          .printable-document * {
            visibility: visible !important;
          }

          .printable-document {
            position: static !important;
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
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            font-size: 12px !important;
            line-height: 1.8 !important;
            box-sizing: border-box !important;
          }

          .no-print {
            display: none !important;
          }

          .editable-span {
            border-bottom: none !important;
            background: transparent !important;
          }

          .editable-select {
            border: none !important;
            background: transparent !important;
            appearance: none !important;
            -webkit-appearance: none !important;
          }

          .copy-section {
            border-top: 1px solid #000 !important;
          }
        }
      `}</style>
    </div>
  );
}