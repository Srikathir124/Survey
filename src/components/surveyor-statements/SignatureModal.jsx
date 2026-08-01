import React from 'react';

export default function SignatureModal({ isOpen, title, onClose, onSave, canvasRef, onStartDrawing, onDraw, onStopDrawing, onClear }) {
  if (!isOpen) return null;

  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '8px',
          padding: '15px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#2b6cb0', marginBottom: '10px', fontSize: '14px' }}>
          {title}
        </div>
        <canvas
          ref={canvasRef}
          width={440}
          height={250}
          onMouseDown={onStartDrawing}
          onMouseMove={onDraw}
          onMouseUp={onStopDrawing}
          onTouchStart={onStartDrawing}
          onTouchMove={onDraw}
          onTouchEnd={onStopDrawing}
          style={{ border: '2px solid #cbd5e0', backgroundColor: '#ffffff', cursor: 'crosshair', borderRadius: '6px', touchAction: 'none' }}
        />
        <div style={{ display: 'flex', width: '100%', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={onClear}
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f56565', color: 'white' }}
          >
            அழி (Clear)
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#718096', color: 'white' }}
          >
            மூடு (Close)
          </button>
          <button
            onClick={onSave}
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#48bb78', color: 'white' }}
          >
            சரி (Save)
          </button>
        </div>
      </div>
    </div>
  );
}
