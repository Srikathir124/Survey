import React, { useState, useEffect, useRef } from 'react';

export default function DrawingPanel({ isOpen, onClose, onSave, initialData, width, height}) {
  const svgRef = useRef(null);
  const PANEL_WIDTH = width;
  const PANEL_HEIGHT = height;

  const [activeTool, setActiveTool] = useState('draw'); // 'draw' | 'draw_firl' | 'add_text' | 'select'
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [firlStartPointIndex, setFirlStartPointIndex] = useState(null);
  const [draggingLabelIndex, setDraggingLabelIndex] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null); // { type, index }
  const [historyStack, setHistoryStack] = useState([]);
  
  // Inline Form States
  const [pendingConnection, setPendingConnection] = useState(null); // { p1Index, p2Index, isNewPoint, pointData }
  const [distInputValue, setDistInputValue] = useState('');

  const [pendingTextInsert, setPendingTextInsert] = useState(null); // { x, y }
  const [textInputValue, setTextInputValue] = useState('');

  const [editingElement, setEditingElement] = useState(null); // { type, index, initialValue }
  const [editInputValue, setEditInputValue] = useState('');

  const [fmbData, setFmbData] = useState({ outerPoints: [], outerLines: [], firlExtensions: [], customLabels: [] });
  const stateRef = useRef(fmbData);
  useEffect(() => { stateRef.current = fmbData; }, [fmbData]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFmbData(initialData);
      setHistoryStack([]);
      setFirlStartPointIndex(null);
      setPendingConnection(null);
      setPendingTextInsert(null);
      setEditingElement(null);
      setActivePointIndex(initialData.outerPoints?.length ? initialData.outerPoints.length - 1 : null);
    }
  }, [isOpen, initialData]);

  const pushToHistory = () => setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(fmbData))]);

  // --- Confirm Line Distance Input ---
  const handleConfirmPendingConnection = (e) => {
    if (e) e.preventDefault();
    if (!pendingConnection) return;

    pushToHistory();
    const st = stateRef.current;
    const finalDist = distInputValue.trim() || '0.0';

    if (pendingConnection.isNewPoint) {
      const newPointIndex = st.outerPoints.length;
      const updatedLines = [...st.outerLines];
      if (pendingConnection.p1Index !== null && st.outerPoints[pendingConnection.p1Index]) {
        updatedLines.push({ p1Index: pendingConnection.p1Index, p2Index: newPointIndex, dist: finalDist });
      }
      setFmbData((prev) => ({
        ...prev,
        outerPoints: [...prev.outerPoints, pendingConnection.pointData],
        outerLines: updatedLines,
      }));
      setActivePointIndex(newPointIndex);
    } else {
      setFmbData((prev) => ({
        ...prev,
        outerLines: [...prev.outerLines, { p1Index: pendingConnection.p1Index, p2Index: pendingConnection.p2Index, dist: finalDist }],
      }));
      setActivePointIndex(pendingConnection.p2Index);
    }
    setPendingConnection(null);
    setDistInputValue('');
  };

  // --- Confirm Survey Number Text Input ---
  const handleConfirmTextInsert = (e) => {
    if (e) e.preventDefault();
    if (!pendingTextInsert) return;

    const val = textInputValue.trim();
    if (val) {
      pushToHistory();
      setFmbData((prev) => ({
        ...prev,
        customLabels: [...prev.customLabels, { id: Date.now(), text: val, x: pendingTextInsert.x, y: pendingTextInsert.y }]
      }));
    }
    setPendingTextInsert(null);
    setTextInputValue('');
  };

  // --- Confirm Edit Line Distance / Survey Text ---
  const handleConfirmEdit = (e) => {
    if (e) e.preventDefault();
    if (!editingElement) return;

    const { type, index } = editingElement;
    const val = editInputValue.trim();

    if (val !== '') {
      pushToHistory();
      setFmbData((prev) => {
        if (type === 'label') {
          const updated = [...prev.customLabels];
          if (updated[index]) updated[index] = { ...updated[index], text: val };
          return { ...prev, customLabels: updated };
        } else if (type === 'line') {
          const updated = [...prev.outerLines];
          if (updated[index]) updated[index] = { ...updated[index], dist: val };
          return { ...prev, outerLines: updated };
        }
        return prev;
      });
    }

    setEditingElement(null);
    setEditInputValue('');
  };

  const handleUndo = () => {
    if (!historyStack.length) return;
    const prev = historyStack[historyStack.length - 1];
    setFmbData(prev);
    setHistoryStack((p) => p.slice(0, -1));
    setSelectedElement(null);
    setFirlStartPointIndex(null);
    setPendingConnection(null);
    setPendingTextInsert(null);
    setEditingElement(null);
    setActivePointIndex(prev.outerPoints?.length ? prev.outerPoints.length - 1 : null);
  };

  const handleResetDrawing = () => {
    if (window.confirm("வரைபடத்தை முழுமையாக அழிக்க விரும்புகிறீர்களா? (Clear drawing?)")) {
      pushToHistory();
      setFmbData({ outerPoints: [], outerLines: [], firlExtensions: [], customLabels: [] });
      setSelectedElement(null);
      setActivePointIndex(null);
      setFirlStartPointIndex(null);
      setPendingConnection(null);
      setPendingTextInsert(null);
      setEditingElement(null);
    }
  };

  const getCanvasCoordinates = (e) => {
    if (!svgRef.current) return { clickX: 0, clickY: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches?.length ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches?.length ? e.touches[0].clientY : e.clientY;
    return {
      clickX: (clientX - rect.left) * (PANEL_WIDTH / rect.width),
      clickY: (clientY - rect.top) * (PANEL_HEIGHT / rect.height),
    };
  };

  const handleCanvasInteraction = (e) => {
    if (pendingConnection || pendingTextInsert || editingElement) return;
    const { clickX, clickY } = getCanvasCoordinates(e);
    const st = stateRef.current;

    if (activeTool === 'add_text') {
      setPendingTextInsert({ x: clickX, y: clickY });
      setTextInputValue('');
    } else if (activeTool === 'draw_firl') {
      if (firlStartPointIndex === null) return alert("FIRL கோடு துவங்க முதலில் ஒரு புள்ளியைத் தேர்ந்தெடுக்கவும்!");
      pushToHistory();
      setFmbData((prev) => ({ ...prev, firlExtensions: [...(prev.firlExtensions || []), { p1Index: firlStartPointIndex, x2: clickX, y2: clickY }] }));
      setFirlStartPointIndex(null);
    } else if (activeTool === 'draw') {
      const newPoint = { x: clickX, y: clickY };
      if (!st.outerPoints.length) {
        pushToHistory();
        setFmbData((prev) => ({ ...prev, outerPoints: [newPoint] }));
        setActivePointIndex(0);
      } else {
        setPendingConnection({ p1Index: activePointIndex, p2Index: null, isNewPoint: true, pointData: newPoint });
        setDistInputValue('');
      }
    }
  };

  const handlePointClick = (index, e) => {
    e.stopPropagation();
    if (pendingConnection || pendingTextInsert || editingElement) return;
    if (activeTool === 'draw_firl') return setFirlStartPointIndex(index);

    if (activeTool === 'draw') {
      const st = stateRef.current;
      if (activePointIndex !== null && activePointIndex !== index) {
        const exists = st.outerLines.some((l) => (l.p1Index === activePointIndex && l.p2Index === index) || (l.p1Index === index && l.p2Index === activePointIndex));
        if (exists) return setActivePointIndex(index);
        setPendingConnection({ p1Index: activePointIndex, p2Index: index, isNewPoint: false });
        setDistInputValue('');
      } else {
        setActivePointIndex(index);
      }
    } else if (activeTool === 'select') {
      setSelectedElement({ type: 'point', index });
      setActivePointIndex(index);
    }
  };

  const handleLabelDrag = (e) => {
    if (draggingLabelIndex === null || !svgRef.current) return;
    const { clickX, clickY } = getCanvasCoordinates(e);
    setFmbData((prev) => {
      const updated = [...prev.customLabels];
      if (updated[draggingLabelIndex]) updated[draggingLabelIndex] = { ...updated[draggingLabelIndex], x: clickX, y: clickY };
      return { ...prev, customLabels: updated };
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedElement) return;
    const { type, index } = selectedElement;
    pushToHistory();

    setFmbData((prev) => {
      if (type === 'label') return { ...prev, customLabels: prev.customLabels.filter((_, i) => i !== index) };
      if (type === 'line') return { ...prev, outerLines: prev.outerLines.filter((_, i) => i !== index) };
      if (type === 'firl_extension') return { ...prev, firlExtensions: prev.firlExtensions.filter((_, i) => i !== index) };
      if (type === 'point') {
        const remap = (i) => (i > index ? i - 1 : i);
        return {
          ...prev,
          outerPoints: prev.outerPoints.filter((_, i) => i !== index),
          outerLines: prev.outerLines.filter((l) => l.p1Index !== index && l.p2Index !== index).map((l) => ({ ...l, p1Index: remap(l.p1Index), p2Index: remap(l.p2Index) })),
          firlExtensions: prev.firlExtensions.filter((ext) => ext.p1Index !== index).map((ext) => ({ ...ext, p1Index: remap(ext.p1Index) })),
        };
      }
      return prev;
    });
    setSelectedElement(null);
    setActivePointIndex(null);
    setFirlStartPointIndex(null);
  };

  const handleStartEditSelected = () => {
    if (!selectedElement) return;
    const { type, index } = selectedElement;
    if (type === 'label' || type === 'line') {
      const initialVal = type === 'label' ? fmbData.customLabels[index]?.text : fmbData.outerLines[index]?.dist;
      setEditingElement({ type, index, initialValue: initialVal || '' });
      setEditInputValue(initialVal || '');
    }
  };

  const renderLineText = (text, p1, p2, isSelected, onClick) => {
    const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy);
    if (!len) return null;

    const finalX = midX + (-dy / len) * -12, finalY = midY + (dx / len) * -12;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle > 90 || angle < -90) angle += 180;

    return (
      <text x={finalX} y={finalY} fill={isSelected ? '#dd6b20' : '#000'} fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central" cursor="pointer" onClick={onClick} transform={`rotate(${angle}, ${finalX}, ${finalY})`}>
        {typeof text === 'number' ? text.toFixed(1) : text || ''}
      </text>
    );
  };

  if (!isOpen) return null;

  const selectLine = (type, index, e) => {
    if (activeTool === 'select') { e.stopPropagation(); setSelectedElement({ type, index }); }
  };

  const resetToolOverlayStates = () => {
    setSelectedElement(null);
    setFirlStartPointIndex(null);
    setPendingConnection(null);
    setPendingTextInsert(null);
    setEditingElement(null);
  };

  return (
    <div className="drawing-modal-overlay">
      <div className="drawing-modal-container">
        <div className="drawing-modal-header">
          <h3 className="drawing-modal-title">Field Sketch</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="drawing-modal-body">
          <div className="drawing-toolbar">
            {[
              { id: 'draw', label: '✏️ Boundary Lines' },
              { id: 'draw_firl', label: '📏 FIRL Line' },
              { id: 'add_text', label: '🔤 Add Survey Number' },
              { id: 'select', label: '🔍 Edit length / Move text' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tool-btn ${activeTool === t.id ? 'tool-btn-active' : ''}`}
                onClick={() => {
                  setActiveTool(t.id);
                  resetToolOverlayStates();
                }}
              >
                {t.label}
              </button>
            ))}
            <button type="button" className="tool-btn btn-undo" onClick={handleUndo} disabled={!historyStack.length} style={{ opacity: historyStack.length ? 1 : 0.5 }}>
              ↺ Undo / Back
            </button>
          </div>

          {activeTool === 'draw_firl' && (
            <div className="firl-hint-banner">
              ℹ️ FIRL கோடு வரைவதற்கு தொடங்கும் புள்ளியைக் கிளிக் செய்து, பின் திசையைக் கிளிக் செய்யவும்.
              {firlStartPointIndex !== null && <strong> — [தொடக்கப் புள்ளி தேர்வு செய்யப்பட்டது!]</strong>}
            </div>
          )}

          {selectedElement && activeTool === 'select' && !editingElement && (
            <div className="selection-action-bar">
              <span className="selection-info">Selected: <strong>{selectedElement.type.replace('_', ' ').toUpperCase()} #{selectedElement.index + 1}</strong></span>
              <div>
                {['label', 'line'].includes(selectedElement.type) && <button type="button" onClick={handleStartEditSelected} className="action-sub-btn edit-btn">✏️ Edit</button>}
                <button type="button" onClick={handleDeleteSelected} className="action-sub-btn delete-btn">❌ Delete</button>
              </div>
            </div>
          )}

          <div className="svg-canvas-wrapper select-none relative">
            {/* FLOATING CARD 1: Distance Measurement Input */}
            {pendingConnection && (
              <form onSubmit={handleConfirmPendingConnection} className="floating-dist-card">
                <span className="floating-card-label">Enter distance:</span>
                <input type="text" value={distInputValue} onChange={(e) => setDistInputValue(e.target.value)} placeholder="0.0" className="floating-card-input" autoFocus />
                <button type="submit" className="floating-card-btn confirm-btn">OK</button>
                <button type="button" onClick={() => setPendingConnection(null)} className="floating-card-btn cancel-btn">Cancel</button>
              </form>
            )}

            {/* FLOATING CARD 2: Survey Number Text Input */}
            {pendingTextInsert && (
              <form onSubmit={handleConfirmTextInsert} className="floating-dist-card">
                <span className="floating-card-label">Survey Number / Text:</span>
                <input type="text" value={textInputValue} onChange={(e) => setTextInputValue(e.target.value)} placeholder="எ.கா. 12/1A" className="floating-card-input wide-input" autoFocus />
                <button type="submit" className="floating-card-btn confirm-btn">OK</button>
                <button type="button" onClick={() => setPendingTextInsert(null)} className="floating-card-btn cancel-btn">Cancel</button>
              </form>
            )}

            {/* FLOATING CARD 3: Edit Length / Text Input */}
            {editingElement && (
              <form onSubmit={handleConfirmEdit} className="floating-dist-card">
                <span className="floating-card-label">
                  {editingElement.type === 'label' ? 'உரையை திருத்தவும்:' : 'அளவை திருத்தவும்:'}
                </span>
                <input type="text" value={editInputValue} onChange={(e) => setEditInputValue(e.target.value)} className="floating-card-input wide-input" autoFocus />
                <button type="submit" className="floating-card-btn confirm-btn">Save</button>
                <button type="button" onClick={() => setEditingElement(null)} className="floating-card-btn cancel-btn">Cancel</button>
              </form>
            )}

              <svg 
                ref={svgRef} 
                width={PANEL_WIDTH || "100%"} 
                height={PANEL_HEIGHT || "80%"} 
                viewBox={`0 0 ${PANEL_WIDTH || "100%"} ${PANEL_HEIGHT || "80%"}`}
                onClick={handleCanvasInteraction} 
                onPointerMove={handleLabelDrag} 
                onPointerUp={() => setDraggingLabelIndex(null)} 
                className="border border-slate-200 rounded shadow-inner bg-white block mx-auto relative touch-none" 
                style={{ touchAction: 'none' }}
              >              
              <g>
                {/* FIRL Extensions */}
                {fmbData.firlExtensions?.map((ext, idx) => {
                  const p1 = fmbData.outerPoints[ext.p1Index];
                  if (!p1) return null;
                  const sel = selectedElement?.type === 'firl_extension' && selectedElement?.index === idx;
                  return <line key={`firl-${idx}`} x1={p1.x} y1={p1.y} x2={ext.x2} y2={ext.y2} stroke={sel ? '#ed8936' : '#000'} strokeWidth={sel ? '4' : '2'} cursor={activeTool === 'select' ? 'pointer' : 'default'} onClick={(e) => selectLine('firl_extension', idx, e)} />;
                })}

                {/* Outer Lines */}
                {fmbData.outerLines.map((line, idx) => {
                  const p1 = fmbData.outerPoints[line.p1Index], p2 = fmbData.outerPoints[line.p2Index];
                  if (!p1 || !p2) return null;
                  const sel = selectedElement?.type === 'line' && selectedElement?.index === idx;
                  return (
                    <g key={`line-${idx}`}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={sel ? '#ed8936' : '#000'} strokeWidth={sel ? '4' : '2.5'} cursor={activeTool === 'select' ? 'pointer' : 'default'} onClick={(e) => selectLine('line', idx, e)} />
                      {renderLineText(line.dist, p1, p2, sel, (e) => selectLine('line', idx, e))}
                    </g>
                  );
                })}

                {/* Pending Line Preview */}
                {pendingConnection && (() => {
                  const p1 = fmbData.outerPoints[pendingConnection.p1Index];
                  const p2 = pendingConnection.isNewPoint ? pendingConnection.pointData : fmbData.outerPoints[pendingConnection.p2Index];
                  return p1 && p2 ? <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#3182ce" strokeWidth="2.5" strokeDasharray="4 4" /> : null;
                })()}

                {/* Points */}
                {fmbData.outerPoints.map((p, idx) => {
                  const active = activeTool === 'draw' && activePointIndex === idx;
                  const firl = activeTool === 'draw_firl' && firlStartPointIndex === idx;
                  const sel = selectedElement?.type === 'point' && selectedElement?.index === idx;

                  return (
                    <g key={`point-${idx}`} onClick={(e) => handlePointClick(idx, e)} className="cursor-pointer">
                      {(active || sel || firl) && <circle cx={p.x} cy={p.y} r="11" fill="none" stroke={firl ? '#3182ce' : '#ed8936'} strokeWidth="2" strokeDasharray="3 3" />}
                      <circle cx={p.x} cy={p.y} r={active || sel || firl ? "7" : "5"} fill={firl ? '#3182ce' : (active || sel ? '#ed8936' : '#2b6cb0')} />
                    </g>
                  );
                })}

                {/* Pending Point Preview */}
                {pendingConnection?.isNewPoint && <circle cx={pendingConnection.pointData.x} cy={pendingConnection.pointData.y} r="6" fill="#3182ce" />}

                {/* Text Marker Preview when Adding Text */}
                {pendingTextInsert && <circle cx={pendingTextInsert.x} cy={pendingTextInsert.y} r="4" fill="#ed8936" />}

                {/* Custom Labels */}
                {fmbData.customLabels.map((lbl, idx) => {
                  const sel = selectedElement?.type === 'label' && selectedElement?.index === idx;
                  return (
                    <g key={`lbl-${lbl.id || idx}`}>
                      {sel && <rect x={lbl.x - 30} y={lbl.y - 14} width="60" height="28" fill="none" stroke="#ed8936" strokeWidth="2" strokeDasharray="3 3" rx="4" />}
                      <text x={lbl.x} y={lbl.y} fill={sel ? '#dd6b20' : '#000'} fontSize="13" fontWeight="bold" textAnchor="middle" dominantBaseline="central" cursor={activeTool === 'select' ? 'grab' : 'default'} onPointerDown={(e) => { if (activeTool === 'select') { e.stopPropagation(); pushToHistory(); setSelectedElement({ type: 'label', index: idx }); setDraggingLabelIndex(idx); } }}>
                        {lbl.text}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        <div className="drawing-modal-footer">
          <button type="button" onClick={handleResetDrawing} className="modal-footer-btn clear-btn">🗑️ Clear</button>
          <div className="footer-right-actions">
            <button type="button" onClick={() => { onSave(fmbData); onClose(); }} className="modal-footer-btn save-btn">💾 Save</button>
          </div>
        </div>
      </div>

      <style>{`
        .drawing-modal-overlay { position: fixed; top: 7%; left: 0; right: 0; bottom: 5%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 10px; }
        .drawing-modal-container { background: white; width: 100%; height: 100%; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden;  }
        .drawing-modal-header { padding: 12px 16px; color: #2b6cb0; display: flex; justify-content: space-between; align-items: center; }
        .drawing-modal-title { margin: 0; font-size: 14px; font-weight: bold; }
        .modal-close-btn { color: #dc2626; background: transparent; border: none; font-size: 32px; cursor: pointer; font-weight: bold; padding: 0 5px; }
        .drawing-modal-body { padding: 12px; overflow-y: auto; flex:1, display:flex; flex-direction: column }
        .drawing-toolbar { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
        .tool-btn { flex: 1 1 15%; min-width: 60px; padding: 8px 4px; background: #edf2f7; color: #2d3748; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; text-align: center; }
        .tool-btn-active { background: #3182ce !important; color: white !important; border-color: #2b6cb0 !important; }
        .btn-undo { background: #feebc8; color: #dd6b20; border-color: #fbd38d; }
        .firl-hint-banner { background: #ebf8ff; border: 1px solid #bee3f8; color: #2b6cb0; padding: 6px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 8px; }
        .selection-action-bar { display: flex; align-items: center; justify-content: space-between; background: #fffaf0; border: 1px solid #feebc8; padding: 6px 10px; border-radius: 6px; margin-bottom: 10px; }
        .selection-info { font-size: 11px; color: #dd6b20; }
        .action-sub-btn { padding: 6px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; border: none; margin-left: 4px; }
        .edit-btn { background: #3182ce; color: white; }
        .delete-btn { background: #e53e3e; color: white; }
        .svg-canvas-wrapper { width: 100%; display: flex; justify-content: center; align-items: center; background: #f8fafc; border-radius: 6px; padding: 4px; position: relative; }
        .floating-dist-card { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); background: #fff; border: 1.5px solid #3182ce; padding: 6px 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(49,130,206,0.25); z-index: 30; display: flex; align-items: center; gap: 8px; }
        .floating-card-label { font-size: 11px; font-weight: bold; color: #2b6cb0; white-space: nowrap; }
        .floating-card-input { width: 70px; padding: 4px 6px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; outline: none; text-align: center; font-weight: bold; }
        .floating-card-input.wide-input { width: 110px; text-align: left; }
        .floating-card-btn { padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 4px; cursor: pointer; border: none; }
        .confirm-btn { background: #3182ce; color: white; }
        .cancel-btn { background: #e2e8f0; color: #4a5568; }
        .drawing-modal-footer { padding: 10px 16px; background: #f7fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .footer-right-actions { display: flex; gap: 8px; }
        .modal-footer-btn { padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; border: none; }
        .clear-btn { background: #e53e3e; color: white; }
        .save-btn { background: #ed8936; color: white; }
        @media (max-width: 480px) {
          .drawing-modal-container { width: 100%; height: 100%; max-height: 100vh; border-radius: 0; }
          .tool-btn { font-size: 10px; padding: 6px 2px; }
          .drawing-modal-body { padding: 8px; }
          .floating-dist-card { width: 90%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
}