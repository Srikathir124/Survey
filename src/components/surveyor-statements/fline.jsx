import React, { useState } from 'react';
import SignatureModal from './SignatureModal';
import DrawingPanel from './DrawingPanel';

export default function FMBReportTool() {
  // --- Form & Page States ---
  const [applicantStatus, setApplicantStatus] = useState('satisfied');
  const [designation, setDesignation] = useState('');

  // Editable fields state
  const [office, setOffice] = useState('');
  const [reqNo, setReqNo] = useState('');
  const [date, setDate] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [survey, setSurvey] = useState('');
  const [applicantName, setApplicantName] = useState('');

  // Drawing Modal State
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [savedFmbData, setSavedFmbData] = useState(null);

  // Signature Data State
  const [signatures, setSignatures] = useState({
    surveyor: null,
    applicant: null,
    witness1: null,
    witness2: null,
  });

  // Modal State for Signatures
  const [activeModal, setActiveModal] = useState({ isOpen: false, target: '', title: '' });

  const PANEL_WIDTH = 550;
  const PANEL_HEIGHT = 320;

  // --- Print Document ---
  const printFMBFinalPDF = () => {
    let originalTitle = document.title;
    document.title = "F Line Statement " + (survey ? survey.replace('/', '|') : ' (' + date + ')');
    window.print();
    document.title = originalTitle;
  };

  // --- Signature Modal Handlers ---
  const openSignatureModal = (target, titleText) => {
    setActiveModal({ isOpen: true, target, title: titleText });
  };

  const closeSignatureModal = () => {
    setActiveModal({ isOpen: false, target: '', title: '' });
  };

  const handleSaveSignature = (signatureDataUrl) => {
    setSignatures((prev) => ({
      ...prev,
      [activeModal.target]: signatureDataUrl,
    }));
  };

  // --- Render Preview SVG inside printable report ---
  const renderSavedSVGReport = () => {
    if (!savedFmbData || !savedFmbData.outerPoints || savedFmbData.outerPoints.length === 0) {
      return (
        <div className="drawing-placeholder-box" onClick={() => setIsDrawingModalOpen(true)}>
          <span>✏️ Click to draw FMB sketch</span>
        </div>
      );
    }

    const st = savedFmbData;
    let linesSVG = [];
    let firlLinesSVG = [];
    let pointsSVG = [];
    let customLabelsSVG = [];

    // 1. Render Measurement Lines
    if (st.outerLines) {
      st.outerLines.forEach((line, idx) => {
        const p1 = st.outerPoints[line.p1Index];
        const p2 = st.outerPoints[line.p2Index];

        if (!p1 || !p2) return;

        let midX = (p1.x + p2.x) / 2;
        let midY = (p1.y + p2.y) / 2;
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let len = Math.sqrt(dx * dx + dy * dy);

        let displayStr = typeof line.dist === 'number' ? line.dist.toFixed(1) : (line.dist || '');

        linesSVG.push(
          <g key={`report-line-g-${idx}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#000000" strokeWidth="2" />
            {len > 0 && (
              <text
                x={midX + (-dy / len) * -12}
                y={midY + (dx / len) * -12}
                fill="#000000"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${(Math.atan2(dy, dx) * 180) / Math.PI > 90 || (Math.atan2(dy, dx) * 180) / Math.PI < -90 ? (Math.atan2(dy, dx) * 180) / Math.PI + 180 : (Math.atan2(dy, dx) * 180) / Math.PI}, ${midX + (-dy / len) * -12}, ${midY + (dx / len) * -12})`}
              >
                {displayStr}
              </text>
            )}
          </g>
        );
      });
    }

    // 2. Render FIRL Lines
    if (st.firlExtensions) {
      st.firlExtensions.forEach((ext, idx) => {
        const p1 = st.outerPoints[ext.p1Index];
        if (!p1) return;

        firlLinesSVG.push(
          <line
            key={`report-firl-${idx}`}
            x1={p1.x}
            y1={p1.y}
            x2={ext.x2}
            y2={ext.y2}
            stroke="#000000"
            strokeWidth="1.8"
          />
        );
      });
    }

    // 3. Render Points
    st.outerPoints.forEach((p, idx) => {
      pointsSVG.push(
        <circle key={`report-dot-${idx}`} cx={p.x} cy={p.y} r="4" fill="#2b6cb0" />
      );
    });

    // 4. Render Custom Labels
    if (st.customLabels) {
      st.customLabels.forEach((lbl, idx) => {
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
        );
      });
    }

    return (
      <svg
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
        viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="border border-slate-200 rounded shadow-inner bg-white block mx-auto relative cursor-pointer"
        onClick={() => setIsDrawingModalOpen(true)}
      >
        <g>
          {firlLinesSVG}
          {linesSVG}
          {pointsSVG}
          {customLabelsSVG}
        </g>
      </svg>
    );
  };

  return (
    <div className="fmb-root-container">
      {/* Top Controls Box */}
      <div className="no-print controls-card">
        <div className="status-select-wrapper">
          <label className="status-label">
            மனுதாரரின் நிலை (Applicant Status):
          </label>
          <select
            className="status-select"
            value={applicantStatus}
            onChange={(e) => setApplicantStatus(e.target.value)}
          >
            <option value="satisfied">1. மனுதாரர்  திருப்தி அடைந்தார் (Satisfied)</option>
            <option value="not_satisfied">2. மனுதாரர் திருப்தி அடையவில்லை (Not Satisfied)</option>
          </select>
        </div>

        <button onClick={printFMBFinalPDF} className="download-pdf-btn">
            Download PDF
        </button>
      </div>

      {/* Main Printable A4 Container */}
      <div className="printable-document-container a4-page">
        <div className={`report-statement-section ${applicantStatus === 'satisfied' ? 'section-border-dashed' : ''}`}>
          <div className="report-title">
            குறுவட்ட அளவரின் அறிக்கை / மனுதாரரின் வாக்குமூலம்
          </div>
          <div className={applicantStatus === 'satisfied' ? 'text-align-left' : 'text-align-right'}>
            வட்டாட்சியர் அலுவலகம்:{' '}
            {applicantStatus === 'satisfied' ? '' : <br />}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setOffice(e.target.innerText)}
            >
              {' ' + office + ' '}
            </span>
          </div>
          <div className="flex-between flex-wrap margin-top-5">
            <div>
              புல எல்லை மனு எண்:{' '}
              <span
                className="editable-span"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setReqNo(e.target.innerText)}
              >
                {' ' + reqNo + ' '}
              </span>
            </div>
            <div>
              நாள்:{' '}
              <span
                className="editable-span"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setDate(e.target.innerText)}
              >
                {' ' + date + ' '}
              </span>
            </div>
          </div>
          <div className="margin-top-8 text-align-justify">
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setDistrict(e.target.innerText)}
            >
              {' ' + district + ' '}
            </span>{' '}
            மாவட்டம்,{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setTaluk(e.target.innerText)}
            >
              {' ' + taluk + ' '}
            </span>{' '}
            வட்டம்,{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setVillage(e.target.innerText)}
            >
              {' ' + village + ' '}
            </span>{' '}
            கிராமம், புல எண்:{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setSurvey(e.target.innerText)}
            >
              {' ' + survey + ' '}
            </span>
            -ன் புல எல்லைகளை அளக்கக் கோரி நான் (திரு / திருமதி){' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setApplicantName(e.target.innerText)}
            >
              {' ' + applicantName + ' '}
            </span>{' '}
            மனு சமர்ப்பித்ததை முன்னிட்டு இன்று ({' ' + date + ' '}){' '}
            <select
              className="editable-select"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            >
              <option value="">--தேர்ந்தெடுக்கவும்--</option>
              <option value="குறுவட்ட நிலஅளவர்">குறுவட்ட நிலஅளவர்</option>
              <option value="நிலஅளவர்">நிலஅளவர்</option>
              <option value="சார் ஆய்வாளர்">சார் ஆய்வாளர்</option>
            </select>{' '}
            <span>
              {applicantStatus === 'satisfied'
                ? 'புலத்தின் எல்லைகளை அளந்து காண்பித்தார். அப்போது நான் உடன் இருந்து எனது புல எல்லைகளை தெரிந்து கொண்டேன்.'
                : 'புலத்தின் எல்லைகளை அளந்து காண்பித்தார். எனக்கு அளவையில் திருப்தி இல்லை என்பதை தெரிவித்துக் கொள்கிறேன்.'}
            </span>
          </div>

          <div className="signature-grid">
            <div className="sig-column"></div>
            <div className="sig-column">
              <div className="sig-display-pad" onClick={() => openSignatureModal('surveyor', 'அளவர் கையொப்பம்')}>
                {signatures.surveyor ? (
                  <img src={signatures.surveyor} alt="Surveyor Sig" className="sig-image" />
                ) : (
                  <span className="sig-placeholder-text">Add Signature</span>
                )}
              </div>
              <div className="sig-label">
                என் முன்பாக<br />({designation || '________'})
              </div>
            </div>
            <div className="sig-column">
              <div className="sig-display-pad" onClick={() => openSignatureModal('applicant', 'மனுதாரர் கையொப்பம்')}>
                {signatures.applicant ? (
                  <img src={signatures.applicant} alt="Applicant Sig" className="sig-image" />
                ) : (
                  <span className="sig-placeholder-text">Add Signature</span>
                )}
              </div>
              <div className="sig-label">
                மனுதாரர் கையொப்பம்
              </div>
            </div>
          </div>

          <div className="witness-section">
            சாட்சிகளின் கையொப்பம்:<br />
            <div className="witness-grid">
              <div className="witness-column">
                <div className="witness-pad" onClick={() => openSignatureModal('witness1', 'சாட்சி 1 கையொப்பம்')}>
                  {signatures.witness1 ? (
                    <img src={signatures.witness1} alt="Witness 1" className="witness-image" />
                  ) : (
                    <span className="sig-placeholder-text font-weight-normal font-size-11">1. Add Signature</span>
                  )}
                </div>
              </div>
              <div className="witness-column">
                <div className="witness-pad" onClick={() => openSignatureModal('witness2', 'சாட்சி 2 கையொப்பம்')}>
                  {signatures.witness2 ? (
                    <img src={signatures.witness2} alt="Witness 2" className="witness-image" />
                  ) : (
                    <span className="sig-placeholder-text font-weight-normal font-size-11">2. Add Signature</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {applicantStatus === 'satisfied' && (
          <div className="fmb-drawing-wrapper">
            <div className="grid-container">
              <div>
                <div>மாவட்டம்: <span className="editable-span">{district}</span></div>
                <div>வட்டம்: <span className="editable-span">{taluk}</span></div>
              </div>
              <div>
                <div>கிராமம்: <span className="editable-span">{village}</span></div>
                <div>புல /உட்பிரிவு எண்:<span className="editable-span">{survey}</span></div>
              </div>
            </div>
            {renderSavedSVGReport()}
            <div>அளவுக்கு வரையப்பட்டதல்ல, </div>
          </div>
          
        )}
      </div>

      {/* Drawing Popup Modal */}
      <DrawingPanel
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSave={(newFmbData) => setSavedFmbData(newFmbData)}
        initialData={savedFmbData}
        width={PANEL_WIDTH}
        height={PANEL_HEIGHT}
      />

      {/* Independent Signature Modal */}
      <SignatureModal
        isOpen={activeModal.isOpen}
        title={activeModal.title}
        onClose={closeSignatureModal}
        onSave={handleSaveSignature}
      />

      <style>{`
        .fmb-root-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f0f4f8;
          align-items: center;
        }
        .controls-card {
          width: 100%;
          max-width: 600px;
          background-color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          margin-bottom: 15px;
        }
        .status-select-wrapper {
          background-color: #ebf8ff;
          padding: 10px;
          border: 1px solid #bee3f8;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .status-label {
          color: #2b6cb0;
          font-size: 13px;
          display: block;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .status-select {
          width: 100%;
          padding: 8px;
          border: 2px solid #3182ce;
          border-radius: 4px;
          font-size: 13px;
          font-weight: bold;
          box-sizing: border-box;
        }
        .open-drawing-btn {
          width: 100%;
          padding: 10px;
          background-color: #3182ce;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .download-pdf-btn {
          width: 100%;
          padding: 10px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
        }
        .printable-document-container {
          background-color: white;
          width: 100%;
          max-width: 600px;
          height: 842px;
          max-height: 842px;
          border: 2px solid #2b6cb0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          position: relative;
          box-sizing: border-box;
          padding: 20px;
          overflow: hidden;
        }
        .report-statement-section {
          box-sizing: border-box;
          font-size: 13px;
          line-height: 1.8;
          color: #000000;
          padding-bottom: 10px;
          text-align: justify;
        }
        .section-border-dashed { border-bottom: 2px dashed #2b6cb0; }
        .report-title {
          text-align: center;
          font-weight: bold;
          font-size: 15px;
          text-decoration: underline;
          margin-bottom: 12px;
          color: #000000;
        }
        .text-align-left { text-align: left; }
        .text-align-right { text-align: right; }
        .text-align-justify { text-align: justify; }
        .flex-between { display: flex; justify-content: space-between; }
        .flex-wrap { flex-wrap: wrap; }
        .margin-top-5 { margin-top: 5px; }
        .margin-top-8 { margin-top: 8px; }
        .editable-span {
          border-bottom: 1px dotted #000000;
          font-weight: bold;
          color: #000000;
          background-color: #f7fafc;
          padding: 0px 4px;
          display: inline-block;
          outline: none;
          min-width: 80px;
        }
        .editable-select {
          border: none;
          border-bottom: 1px dotted #000000;
          font-weight: bold;
          color: #000000;
          background-color: #f7fafc;
          padding: 0px 2px;
          font-size: 13px;
          cursor: pointer;
          display: inline-block;
          white-space: nowrap;
          width: auto;
        }
        .signature-grid {
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
        }
        .sig-column {
          text-align: center;
          width: 32%;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #000000;
        }
        .sig-display-pad {
          border: 1px solid #cbd5e0;
          background-color: #fafafa;
          width: 100%;
          height: 45px;
          margin-bottom: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
        }
        .sig-image { width: 100%; height: 100%; object-fit: contain; }
        .sig-placeholder-text { font-size: 10px; color: #a0aec0; font-weight: bold; }
        .sig-label { font-size: 11px; font-weight: bold; line-height: 1.2; color: #000000; }
        .witness-section { margin-top: 10px; font-size: 12px; font-weight: bold; color: #000000; }
        .witness-grid { display: flex; justify-content: space-between; margin-top: 5px; }
        .witness-column { width: 48%; display: flex; flex-direction: column; align-items: flex-start; }
        .witness-pad {
          border-bottom: 1px solid #000000;
          width: 100%;
          height: 35px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #fafafa;
        }
        .witness-image { height: 100%; object-fit: contain; }
        .font-weight-normal { font-weight: normal; }
        .font-size-11 { font-size: 11px; }
        .grid-container { display: grid; grid-template-columns: 1fr 1fr; margin-top: 5px; font-size: 12px; }
        .fmb-drawing-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
        .drawing-placeholder-box {
          width: 550px;
          height: 320px;
          border: 2px dashed #cbd5e0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #fafafa;
          cursor: pointer;
          color: #4a5568;
          font-weight: bold;
          font-size: 13px;
        }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background-color: white !important;
          }
          body * { visibility: hidden !important; }

          .printable-document-container,
          .printable-document-container * {
            visibility: visible !important;
          }

          .printable-document-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 12mm 15mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .fmb-drawing-wrapper {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin-top: 10px !important;
          }

          svg {
            border: none !important;
            max-height: 310px !important;
            width: 100% !important;
            max-width: 180mm !important;
            margin: 0 auto !important;
          }

          .no-print { display: none !important; }
          .editable-span { border: none !important; background: transparent !important; padding: 0 !important; }
          .editable-select {
            border: none !important;
            background: transparent !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            padding: 0 !important;
          }
          .sig-display-pad, .witness-pad { border: none !important; background: transparent !important; }
          .sig-placeholder-text { display: none !important; }
        }
      `}</style>
    </div>
  );
}