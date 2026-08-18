import React, { useState } from 'react';
import FLineSatisfied from './FLineSatisfied';
import FLineNotSatisfied from './FLineNotSatisfied';
import SignatureModal from './SignatureModal';
import DrawingPanel from './DrawingPanel';
import FileNameModal from './FileNameModal';
import { trackEvent } from '../../utils/analytics.js';

export default function FLineStatement() {
  const [applicantStatus, setApplicantStatus] = useState('satisfied');
  const [designation, setDesignation] = useState('குறுவட்ட அளவர்');
  const [office, setOffice] = useState('');
  const [reqNo, setReqNo] = useState('');
  const [date, setDate] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [survey, setSurvey] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [savedFmbData, setSavedFmbData] = useState(null);
  const [signatures, setSignatures] = useState({ surveyor: null, applicant: null, witness1: null, witness2: null });
  const [activeModal, setActiveModal] = useState({ isOpen: false, target: '', title: '' });
  const [showFileNameModal, setShowFileNameModal] = useState(false);

  const PANEL_WIDTH = 550, PANEL_HEIGHT = 360;

  const openSignatureModal = (target, title) => setActiveModal({ isOpen: true, target, title });
  const closeSignatureModal = () => setActiveModal({ isOpen: false, target: '', title: '' });
  const handleSaveSignature = (data) => setSignatures(prev => ({ ...prev, [activeModal.target]: data }));

  const renderSavedSVGReport = () => {
    if (!savedFmbData?.outerPoints?.length) {
      return (
        <div className="drawing-placeholder-box" onClick={() => setIsDrawingModalOpen(true)}>
          <span>✏️ Click to draw FMB sketch</span>
        </div>
      );
    }
    const st = savedFmbData;
    const linesSVG = [], firlLinesSVG = [], pointsSVG = [], customLabelsSVG = [];

    if (st.outerLines) {
      st.outerLines.forEach((line, idx) => {
        const p1 = st.outerPoints[line.p1Index], p2 = st.outerPoints[line.p2Index];
        if (!p1 || !p2) return;
        const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const displayStr = typeof line.dist === 'number' ? line.dist.toFixed(1) : (line.dist || '');
        const rot = (Math.atan2(dy, dx) * 180) / Math.PI;
        const finalRot = rot > 90 || rot < -90 ? rot + 180 : rot;
        const offX = midX + (-dy / len) * -12, offY = midY + (dx / len) * -12;
        linesSVG.push(
          <g key={`report-line-g-${idx}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#000000" strokeWidth="2" />
            {len > 0 && (
              <text
                x={offX}
                y={offY}
                fill="#000000"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${finalRot}, ${offX}, ${offY})`}
              >
                {displayStr}
              </text>
            )}
          </g>
        );
      });
    }
    if (st.firlExtensions) {
      st.firlExtensions.forEach((ext, idx) => {
        const p1 = st.outerPoints[ext.p1Index];
        if (p1) {
          firlLinesSVG.push(
            <line key={`report-firl-${idx}`} x1={p1.x} y1={p1.y} x2={ext.x2} y2={ext.y2} stroke="#000000" strokeWidth="1.8" />
          );
        }
      });
    }
    st.outerPoints.forEach((p, idx) =>
      pointsSVG.push(<circle key={`report-dot-${idx}`} cx={p.x} cy={p.y} r="4" fill="#2b6cb0" />)
    );
    if (st.customLabels) {
      st.customLabels.forEach((lbl, idx) =>
        customLabelsSVG.push(
          <text
            key={`report-lbl-${idx}`}
            x={lbl.x}
            y={lbl.y}
            fill="#000000"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {lbl.text}
          </text>
        )
      );
    }
    return (
      <svg
        viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="fmb-rendered-svg"
        onClick={() => setIsDrawingModalOpen(true)}
      >
        <g>{firlLinesSVG}{linesSVG}{pointsSVG}{customLabelsSVG}</g>
      </svg>
    );
  };

  const EditableSpan = ({ value, onChange, minWidth = "30px", className = "" }) => (
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

  const SigPad = ({ sig, onClick, label, placeholder }) => (
    <div className="sig-display-pad" onClick={onClick}>
      {sig ? <img src={sig} alt={label} className="sig-image" /> : <span className="sig-placeholder-text">{placeholder}</span>}
    </div>
  );

  const isSatisfied = applicantStatus === 'satisfied';

  const sharedProps = {
    office, setOffice,
    reqNo, setReqNo,
    date, setDate,
    district, setDistrict,
    taluk, setTaluk,
    village, setVillage,
    survey, setSurvey,
    applicantName, setApplicantName,
    designation, setDesignation,
    signatures,
    openSignatureModal,
    EditableSpan,
    SigPad
  };

  return (
    <div className="fmb-root-container">
      <div className="no-print controls-card">
        <div className="status-radio-group">
          {['satisfied', 'not_satisfied'].map(status => (
            <label key={status} className="status-radio">
              <input
                type="radio"
                name="applicantStatus"
                value={status}
                checked={applicantStatus === status}
                onChange={(e) => setApplicantStatus(e.target.value)}
              />
              <span>{status === 'satisfied' ? 'மனுதாரர் திருப்தி அடைந்தார் (Satisfied)' : 'மனுதாரர் திருப்தி அடையவில்லை (Not Satisfied)'}</span>
            </label>
          ))}
        </div>
        <button onClick={() => setShowFileNameModal(true)} className="download-pdf-btn">Download PDF</button>
      </div>

      <div className="printable-document-wrapper">
        {isSatisfied ? (
          <FLineSatisfied
            {...sharedProps}
            renderSavedSVGReport={renderSavedSVGReport}
          />
        ) : (
          <FLineNotSatisfied
            {...sharedProps}
          />
        )}
      </div>

      <DrawingPanel
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSave={setSavedFmbData}
        initialData={savedFmbData}
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
      />
      <SignatureModal
        isOpen={activeModal.isOpen}
        title={activeModal.title}
        onClose={closeSignatureModal}
        onSave={handleSaveSignature}
      />
      <FileNameModal
        isOpen={showFileNameModal}
        title="Download PDF"
        defaultName={`F Line Statement ${survey || ""}`}
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
          trackEvent("F_Line_pdf_generated", { document_name: fileName });
        }}
      />

      <style>{`
        .fmb-root-container {
          width: 100%;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #f1f5f9;
          padding: 8px 0;
          margin: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-x: hidden;
        }
        .controls-card {
          width: 100%;
          max-width: 580px;
          background: #ffffff;
          border-radius: 6px;
          padding: 10px 12px;
          margin: 0 0 10px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          box-sizing: border-box;
        }
        .status-radio-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
        }
        .status-radio {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
        }
        .status-radio input[type="radio"] {
          width: 14px;
          height: 14px;
          accent-color: #2563eb;
        }
        .download-pdf-btn {
          width: 100%;
          padding: 8px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 12px;
        }

        .printable-document-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 0 14px 0;
          margin: 0;
          box-sizing: border-box;
        }

        .printable-document-container {
          width: 100%;
          max-width: 580px;
          background-color: #ffffff;
          border: 1.5px solid #2b6cb0;
          box-sizing: border-box;
          color: #000000;
          overflow: hidden;
          margin: 0;
        }

        .satisfied-container {
          padding: 10px 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .not-satisfied-container {
          padding: 16px 8px 40px 8px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .report-statement-section {
          width: 100%;
          font-size: 11px;
          line-height: 1.6;
          color: #000000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0;
          padding: 0;
        }
        .not-satisfied-container .report-statement-section {
          gap: 16px;
        }

        .report-title {
          text-align: center;
          margin: 0;
          padding: 0;
        }
        .report-title h2 {
          display: inline-block;
          font-size: 11.5px;
          font-weight: bold;
          margin: 0;
          border-bottom: 1.2px solid #000000;
          padding-bottom: 2px;
          color: #000000;
        }

        .report-row {
          display: flex;
          align-items: baseline;
          font-size: 11px;
          gap: 4px;
          margin: 0;
          padding: 0;
        }
        .flex-wrap {
          flex-wrap: wrap;
        }
        .bold-label {
          font-weight: 600;
          white-space: nowrap;
        }
        .justify-end {
          justify-content: flex-end;
        }
        .text-right {
          text-align: right;
        }
        .not-sat-office {
          line-height: 1.5;
        }
        .not-sat-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .flex-between {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        .gap-2 {
          gap: 6px;
        }
        .meta-item {
          display: flex;
          align-items: baseline;
          gap: 4px;
          flex-wrap: wrap;
        }

        .report-body-text {
          font-size: 11px;
          line-height: 1.75;
          text-align: justify;
          font-weight: 500;
          word-break: break-word;
          margin: 0;
          padding: 0;
        }

        .editable-span {
          border-bottom: 1px dotted #000000;
          font-weight: 600;
          color: #000000;
          padding: 0 2px;
          margin: 0;
          display: inline-block;
          outline: none;
          min-height: 14px;
          vertical-align: baseline;
          text-align: center;
          max-width: 100%;
          box-sizing: border-box;
        }
        .editable-select {
          border: none;
          border-bottom: 1px dotted #000000;
          font-weight: 600;
          color: #000000;
          background: transparent;
          font-size: 11px;
          outline: none;
          cursor: pointer;
          padding: 0 1px;
          margin: 0;
        }

        /* Signatures */
        .signature-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 100%;
          padding: 4px 0 0 0;
          margin: 0;
          box-sizing: border-box;
        }
        .not-satisfied-container .signature-grid {
          padding-top: 16px;
        }
        .sig-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 48%;
          max-width: 130px;
          margin: 0;
          padding: 0;
        }
        .sig-display-pad {
          border: 1px dashed #cbd5e0;
          background-color: #f8fafc;
          width: 100%;
          height: 32px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .sig-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .sig-placeholder-text {
          font-size: 8.5px;
          color: #94a3b8;
        }
        .sig-label {
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
          margin: 0;
          padding: 0;
        }

        /* Witness Section */
        .witness-section {
          width: 100%;
          font-size: 10.5px;
          font-weight: 600;
          margin: 2px 0 0 0;
          padding: 0;
        }
        .not-satisfied-container .witness-section {
          margin-top: 14px;
        }
        .witness-header-title {
          margin-bottom: 4px;
        }
        .witness-grid {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .witness-item {
          display: flex;
          align-items: flex-end;
          flex: 1;
          gap: 4px;
          margin: 0;
          padding: 0;
        }
        .witness-stacked-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .witness-stacked-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .witness-line {
          flex: 1;
          border-bottom: 1px solid #000000;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .witness-line.full-width {
          width: 100%;
        }
        .witness-img {
          max-height: 18px;
          max-width: 100%;
          object-fit: contain;
        }

        /* FMB Section */
        .fmb-sketch-box {
          padding: 6px 4px 4px 4px;
          margin: 0;
          position: relative;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .fmb-details-grid {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          gap: 4px;
          width: 100%;
          font-size: 10px;
          font-weight: 600;
          line-height: 1.5;
          margin: 0;
          padding: 0;
        }
        .fmb-detail-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          margin: 0;
          padding: 0;
        }
        .fmb-detail-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin: 0;
          padding: 0;
        }
        .fmb-detail-row .lbl {
          display: inline-block;
          margin-right: 2px;
          white-space: nowrap;
        }
        .fmb-drawing-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 150px;
          margin: 4px 0;
          padding: 0;
        }
        .drawing-placeholder-box {
          width: 100%;
          height: 150px;
          border: 1.5px dashed #cbd5e0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          font-weight: bold;
          font-size: 11px;
        }
        .fmb-rendered-svg {
          width: 100%;
          max-height: 180px;
          cursor: pointer;
        }
        .fmb-note-text {
          font-size: 9px;
          font-weight: 600;
          text-align: center;
          margin: 0;
          padding: 0;
        }

        /* Print Media Styles */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-document-wrapper,
          .printable-document-container,
          .printable-document-container * {
            visibility: visible !important;
          }
          .printable-document-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .printable-document-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          .satisfied-container {
            padding: 10mm 10mm !important;
            gap: 14px !important;
          }
          .not-satisfied-container {
            padding: 18mm 16mm !important;
            gap: 24px !important;
          }
          .report-statement-section {
            font-size: 24px !important;
            line-height: 2.3 !important;
          }
          .report-title h2 {
            font-size: 14px !important;
          }
          .report-row, .report-body-text, .witness-section, .fmb-details-grid {
            font-size: 12px !important;
          }
          .fmb-sketch-box {
            min-height: 480px !important;
          }
          .fmb-drawing-area {
            min-height: 380px !important;
          }
          .fmb-rendered-svg {
            max-height: 380px !important;
          }
          .no-print {
            display: none !important;
          }
          .editable-span {
            border-bottom: 1px solid #1e1e1e !important;
            background: transparent !important;
          }
          .editable-select {
            border: none solid !important;
            background: transparent !important;
            appearance: none !important;
            -webkit-appearance: none !important;
          }
          .sig-display-pad {
            border: none !important;
            background: transparent !important;
          }
          .sig-placeholder-text,
          .drawing-placeholder-box {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}