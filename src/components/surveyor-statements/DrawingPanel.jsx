import React from 'react';

export default function DrawingPanel({ canvasRef, onCanvasClick, width = 550, height = 400 }) {
  return (
    <div>
      {/* Canvas Wrapper */}
      <div className="relative flex-1 bg-white overflow-hidden cursor-crosshair flex justify-center items-center p-2">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={onCanvasClick}
          className="border border-slate-200 rounded shadow-inner bg-white block"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}