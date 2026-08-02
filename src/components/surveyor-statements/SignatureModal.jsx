import React, { useRef, useState, useEffect } from 'react';

export default function SignatureModal({ isOpen, title, onClose, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Clear canvas when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        clearCanvas();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Helper to Extract Touch/Mouse Coordinates ---
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // --- Drawing Handlers ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureDataUrl = canvas.toDataURL('image/png');
      onSave(signatureDataUrl);
    }
    onClose();
  };

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
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            border: '2px solid #cbd5e0',
            backgroundColor: '#ffffff',
            cursor: 'crosshair',
            borderRadius: '6px',
            touchAction: 'none',
            maxWidth: '100%',
            height: 'auto',
          }}
        />

        <div style={{ display: 'flex', width: '100%', gap: '10px', marginTop: '15px' }}>
          <button
            type="button"
            onClick={clearCanvas}
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f56565', color: 'white' }}
          >
            அழி (Clear)
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#718096', color: 'white' }}
          >
            மூடு (Close)
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#48bb78', color: 'white' }}
          >
            சரி (Save)
          </button>
        </div>
      </div>
    </div>
  );
}