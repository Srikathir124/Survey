import React from 'react';

export default function FLineSatisfied({
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
  renderSavedSVGReport,
  EditableSpan,
  SigPad
}) {
  return (
    <div className="printable-document-container a4-page satisfied-container">
      <div className="report-statement-section">
        {/* Title */}
        <div className="report-title">
          <h2>குறுவட்ட அளவரின் அறிக்கை / மனுதாரரின் வாக்குமூலம்</h2>
        </div>

        {/* Office Row */}
        <div className="report-row flex-wrap">
          <span className="bold-label">வட்டாட்சியர் அலுவலகம் :</span>
          <EditableSpan value={office} onChange={setOffice} minWidth="80px" />
        </div>

        {/* Application & Date Row */}
        <div className="report-row flex-between flex-wrap gap-2">
          <div className="meta-item">
            <span className="bold-label">மனு எண் :</span>
            <EditableSpan value={reqNo} onChange={setReqNo} minWidth="60px" />
          </div>
          <div className="meta-item">
            <span className="bold-label">நாள் :</span>
            <EditableSpan value={date} onChange={setDate} minWidth="60px" />
          </div>
        </div>

        {/* Statement Body */}
        <div className="report-body-text">
          <EditableSpan value={district} onChange={setDistrict} minWidth="45px" /> மாவட்டம்,{' '}
          <EditableSpan value={taluk} onChange={setTaluk} minWidth="45px" /> வட்டம்,{' '}
          <EditableSpan value={village} onChange={setVillage} minWidth="45px" /> கிராமம், புல எண் :{' '}
          <EditableSpan value={survey} onChange={setSurvey} minWidth="40px" />
          {' '}புல எல்லைகளை அளக்கக் கோரி நான் (திரு / திருமதி){' '}
          <EditableSpan value={applicantName} onChange={setApplicantName} minWidth="65px" />
          {' '}மனு சமர்ப்பித்ததை முன்னிட்டு இன்று ({' '}
          <EditableSpan value={date} onChange={setDate} minWidth="40px" />
          {' '}){' '}
          <select className="editable-select" value={designation} onChange={(e) => setDesignation(e.target.value)}>
            <option value="குறுவட்ட அளவர்">குறுவட்ட அளவர்</option>
            <option value="நிலஅளவர்">நிலஅளவர்</option>
            <option value="சார் ஆய்வாளர்">சார் ஆய்வாளர்</option>
          </select>{' '}
          மேற்படி புலத்தின் எல்லைகளை அளந்து காண்பித்தார். அப்போது நான் உடன் இருந்து எனது புல எல்லைகளை தெரிந்து கொண்டேன்.
        </div>

        {/* Signatures */}
        <div className="signature-grid">
          <div className="sig-column">
            <SigPad
              sig={signatures.surveyor}
              onClick={() => openSignatureModal('surveyor', 'அளவர் கையொப்பம்')}
              label="Surveyor Sig"
              placeholder="Add Signature"
            />
            <div className="sig-label">
              /என் முன்பாக/<br />({designation || 'குறுவட்ட அளவர்'})
            </div>
          </div>
          <div className="sig-column">
            <SigPad
              sig={signatures.applicant}
              onClick={() => openSignatureModal('applicant', 'மனுதாரர் கையொப்பம்')}
              label="Applicant Sig"
              placeholder="Add Signature"
            />
            <div className="sig-label">மனுதாரர் கையொப்பம்</div>
          </div>
        </div>

        {/* Witnesses Section */}
        <div className="witness-section">
          <div className="witness-header-title">சாட்சிகளின் கையொப்பம் :</div>
          <div className="witness-grid">
            <div className="witness-item">
              <span>1.</span>
              <div className="witness-line" onClick={() => openSignatureModal('witness1', 'சாட்சி 1')}>
                {signatures.witness1 ? <img src={signatures.witness1} alt="Witness 1" className="witness-img" /> : <span className="sig-placeholder-text">Add Signature</span>}
              </div>
            </div>
            <div className="witness-item">
              <span>2.</span>
              <div className="witness-line" onClick={() => openSignatureModal('witness2', 'சாட்சி 2')}>
                {signatures.witness2 ? <img src={signatures.witness2} alt="Witness 2" className="witness-img" /> : <span className="sig-placeholder-text">Add Signature</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FMB Sketch Section */}
      <div className="fmb-sketch-box">
        <div className="fmb-details-grid">
          <div className="fmb-detail-col">
            <div className="fmb-detail-row">
              <span className="lbl">மாவட்டம் :</span>
              <EditableSpan value={district} onChange={setDistrict} minWidth="40px" />
            </div>
            <div className="fmb-detail-row">
              <span className="lbl">வட்டம் :</span>
              <EditableSpan value={taluk} onChange={setTaluk} minWidth="40px" />
            </div>
          </div>
          <div className="fmb-detail-col">
            <div className="fmb-detail-row">
              <span className="lbl">கிராமம் :</span>
              <EditableSpan value={village} onChange={setVillage} minWidth="40px" />
            </div>
            <div className="fmb-detail-row">
              <span className="lbl">புல எண் /உட்பிரிவு எண் :</span>
              <EditableSpan value={survey} onChange={setSurvey} minWidth="35px" />
            </div>
          </div>
        </div>

        <div className="fmb-drawing-area">
          {renderSavedSVGReport()}
        </div>

        <div className="fmb-note-text">அளவுக்கு வரையப்பட்டதல்ல,</div>
      </div>
      <style>{`
        
      `}</style>
    </div>
  );
}