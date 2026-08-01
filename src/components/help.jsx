// help.jsx
import React from 'react';
// import './Help.css';

function Help() {
  return (
    <div className="help-container">
      <div className="help-icon">💬</div>

      <p className="help-text">
        If you are facing any issue or difficulty in this app, please send an Email to{' '}
        <a href="mailto:srikathir124@gmail.com" className="help-link">
          srikathir124@gmail.com
        </a>{' '}
        or a WhatsApp to{' '}
        <a
          href="http://wa.me/+918489301447"
          target="_blank"
          rel="noopener noreferrer"
          className="help-link"
        >
          +91 8489301447
        </a>.
      </p>

      <div className="help-signature">
        <p className="signature-name">V. Sri Kathiravan</p>
        <p className="signature-role">Field Surveyor</p>
        <p className="signature-location">Kallakurichi</p>
      </div>

      <style>{`
        .help-container {
          max-width: 420px;
          padding: 20px 24px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #111827;
        }

        .help-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .help-title {
          margin: 0 0 10px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .help-text {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
        }

        .help-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .help-link:hover {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
        }

        .help-link:focus {
          outline: 2px solid #93c5fd;
          outline-offset: 2px;
          border-radius: 2px;
        }

        .help-signature {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid #f3f4f6;
          font-size: 13px;
          line-height: 1.5;
          color: #4b5563;

          /* Right-align the signature block */
          text-align: right;
          width: 100%;
          display: block;
        }

        .signature-name {
          margin: 0;
          font-weight: 600;
          color: #111827;
        }

        .signature-role,
        .signature-location {
          margin: 2px 0 0;
        }
      `}
      </style>
    </div>
  );
}

export default Help;