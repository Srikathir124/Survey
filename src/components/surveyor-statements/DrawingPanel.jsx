import React, { useState, useEffect, useRef } from 'react';

export default function DrawingPanel({
  isOpen,
  onClose,
  onSave,
  initialData,
  width = 550,
  height = 320,
}) {
  const svgRef = useRef(null);
  const PANEL_WIDTH = width;
  const PANEL_HEIGHT = height;

  // Active Drawing Tool: 'draw' | 'draw_firl' | 'add_text' | 'select'
  const [activeTool, setActiveTool] = useState('draw');

  // Active/Last Selected Point Index
  const [activePointIndex, setActivePointIndex] = useState(null);

  // Selected Start Point for FIRL extension
  const [firlStartPointIndex, setFirlStartPointIndex] = useState(null);

  // Dragging state for custom labels
  const [draggingLabelIndex, setDraggingLabelIndex] = useState(null);

  // Selected Element State: { type: 'point'|'line'|'firl_extension'|'label', index: number }
  const [selectedElement, setSelectedElement] = useState(null);

  // Core Drawing State
  const [fmbData, setFmbData] = useState({
    outerPoints: [],
    outerLines: [],        // Array of { p1Index, p2Index, dist }
    firlExtensions: [],    // Array of { p1Index, x2, y2 } (Direction vector only, no point or dist)
    customLabels: [],      // Array of { id, text, x, y }
  });

  // Action History Stack for Undo
  const [historyStack, setHistoryStack] = useState([]);

  const stateRef = useRef(fmbData);
  useEffect(() => {
    stateRef.current = fmbData;
  }, [fmbData]);

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFmbData(initialData);
      setHistoryStack([]);
      setFirlStartPointIndex(null);
      if (initialData.outerPoints && initialData.outerPoints.length > 0) {
        setActivePointIndex(initialData.outerPoints.length - 1);
      }
    }
  }, [isOpen, initialData]);

  // Record state snapshot before mutation for Undo
  const pushToHistory = () => {
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(fmbData))]);
  };

  // --- Undo Last Action ---
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previousState = historyStack[historyStack.length - 1];
    setFmbData(previousState);
    setHistoryStack((prev) => prev.slice(0, -1));
    setSelectedElement(null);
    setFirlStartPointIndex(null);
    if (previousState.outerPoints && previousState.outerPoints.length > 0) {
      setActivePointIndex(previousState.outerPoints.length - 1);
    } else {
      setActivePointIndex(null);
    }
  };

  // --- Reset Drawing ---
  const handleResetDrawing = () => {
    if (window.confirm("வரைபடத்தை முழுமையாக அழிக்க விரும்புகிறீர்களா? (Clear drawing?)")) {
      pushToHistory();
      setFmbData({
        outerPoints: [],
        outerLines: [],
        firlExtensions: [],
        customLabels: [],
      });
      setSelectedElement(null);
      setActivePointIndex(null);
      setFirlStartPointIndex(null);
    }
  };

  // --- Save Drawing Handler ---
  const handleSaveDrawing = () => {
    onSave(fmbData);
    onClose();
  };

  // --- Helper to Extract Touch/Mouse Coordinates ---
  const getCanvasCoordinates = (e) => {
    if (!svgRef.current) return { clickX: 0, clickY: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    const scaleX = PANEL_WIDTH / rect.width;
    const scaleY = PANEL_HEIGHT / rect.height;

    return {
      clickX: (clientX - rect.left) * scaleX,
      clickY: (clientY - rect.top) * scaleY,
    };
  };

  // --- Unified Tap/Click Handler for Empty Canvas Areas ---
  const handleCanvasInteraction = (e) => {
    const { clickX, clickY } = getCanvasCoordinates(e);
    const st = stateRef.current;

    // 1. ADD TEXT MODE
    if (activeTool === 'add_text') {
      let labelText = prompt("சேர்க்க வேண்டிய உரையை தட்டச்சு செய்யவும் (Enter text):");
      if (labelText) {
        pushToHistory();
        setFmbData((prev) => ({
          ...prev,
          customLabels: [
            ...prev.customLabels,
            { id: Date.now(), text: labelText, x: clickX, y: clickY }
          ]
        }));
      }
      return;
    }

    // 2. FIRL MODE: Directs open extension line from selected boundary point into space
    if (activeTool === 'draw_firl') {
      if (firlStartPointIndex === null) {
        alert("FIRL கோடு துவங்க முதலில் ஒரு புள்ளியைத் தேர்ந்தெடுக்கவும்! (Please select a boundary point first)");
        return;
      }

      pushToHistory();
      setFmbData((prev) => ({
        ...prev,
        firlExtensions: [
          ...(prev.firlExtensions || []),
          { p1Index: firlStartPointIndex, x2: clickX, y2: clickY }
        ]
      }));
      setFirlStartPointIndex(null);
      return;
    }

    // 3. STANDARD DRAW POINT MODE
    if (activeTool === 'draw') {
      const newPoint = { x: clickX, y: clickY };
      const newPointIndex = st.outerPoints.length;

      // FIRST POINT: Place directly without distance prompt
      if (st.outerPoints.length === 0) {
        pushToHistory();
        setFmbData((prev) => ({
          ...prev,
          outerPoints: [newPoint],
        }));
        setActivePointIndex(0);
        return;
      }

      // SUBSEQUENT POINTS: Prompt for measurement distance
      let measInput = prompt("புள்ளிக்கான தூரம் / அளவை உள்ளிடவும் (Enter measurement text):", "0.0");
      if (measInput === null) return;

      pushToHistory();

      let updatedLines = [...st.outerLines];

      if (activePointIndex !== null && st.outerPoints[activePointIndex]) {
        updatedLines.push({
          p1Index: activePointIndex,
          p2Index: newPointIndex,
          dist: measInput || "0.0",
        });
      }

      setFmbData((prev) => ({
        ...prev,
        outerPoints: [...prev.outerPoints, newPoint],
        outerLines: updatedLines,
      }));

      setActivePointIndex(newPointIndex);
    }
  };

  // --- Point Click Handler ---
  const handlePointClick = (index, e) => {
    e.stopPropagation();

    // In FIRL mode, select the anchor point to extend from
    if (activeTool === 'draw_firl') {
      setFirlStartPointIndex(index);
      return;
    }

    if (activeTool === 'draw') {
      setActivePointIndex(index);
    } else if (activeTool === 'select') {
      setSelectedElement({ type: 'point', index });
      setActivePointIndex(index);
    }
  };

  // --- Drag and Drop Logic ---
  const handleLabelDragStart = (index, e) => {
    if (activeTool === 'select') {
      e.stopPropagation();
      pushToHistory();
      setSelectedElement({ type: 'label', index });
      setDraggingLabelIndex(index);
    }
  };

  const handlePointerMove = (e) => {
    if (draggingLabelIndex === null || !svgRef.current) return;
    const { clickX, clickY } = getCanvasCoordinates(e);

    setFmbData((prev) => {
      const updated = [...prev.customLabels];
      if (updated[draggingLabelIndex]) {
        updated[draggingLabelIndex] = {
          ...updated[draggingLabelIndex],
          x: clickX,
          y: clickY,
        };
      }
      return { ...prev, customLabels: updated };
    });
  };

  const handlePointerUp = () => {
    setDraggingLabelIndex(null);
  };

  // --- Selection Actions (Delete / Edit) ---
  const handleDeleteSelected = () => {
    if (!selectedElement) return;
    const { type, index } = selectedElement;

    pushToHistory();

    if (type === 'label') {
      setFmbData((prev) => ({
        ...prev,
        customLabels: prev.customLabels.filter((_, i) => i !== index)
      }));
    } else if (type === 'point') {
      setFmbData((prev) => {
        const filteredLines = prev.outerLines.filter(
          (l) => l.p1Index !== index && l.p2Index !== index
        ).map((l) => ({
          ...l,
          p1Index: l.p1Index > index ? l.p1Index - 1 : l.p1Index,
          p2Index: l.p2Index > index ? l.p2Index - 1 : l.p2Index,
        }));

        const filteredFirlExt = (prev.firlExtensions || []).filter(
          (ext) => ext.p1Index !== index
        ).map((ext) => ({
          ...ext,
          p1Index: ext.p1Index > index ? ext.p1Index - 1 : ext.p1Index,
        }));

        const filteredPoints = prev.outerPoints.filter((_, i) => i !== index);
        return {
          ...prev,
          outerPoints: filteredPoints,
          outerLines: filteredLines,
          firlExtensions: filteredFirlExt,
        };
      });
      setActivePointIndex(null);
      setFirlStartPointIndex(null);
    } else if (type === 'line') {
      setFmbData((prev) => ({
        ...prev,
        outerLines: prev.outerLines.filter((_, i) => i !== index),
      }));
    } else if (type === 'firl_extension') {
      setFmbData((prev) => ({
        ...prev,
        firlExtensions: prev.firlExtensions.filter((_, i) => i !== index),
      }));
    }
    setSelectedElement(null);
  };

  const handleEditSelected = () => {
    if (!selectedElement) return;
    const { type, index } = selectedElement;

    if (type === 'label') {
      let currentVal = fmbData.customLabels[index]?.text || '';
      let newVal = prompt('உரையை மாற்றவும் (Edit text):', currentVal);
      if (newVal !== null) {
        pushToHistory();
        setFmbData((prev) => {
          const updated = [...prev.customLabels];
          updated[index] = { ...updated[index], text: newVal };
          return { ...prev, customLabels: updated };
        });
      }
    } else if (type === 'line') {
      let currentVal = fmbData.outerLines[index]?.dist || '';
      let newVal = prompt('அளவை மாற்றியமைக்கவும் (Edit measurement):', currentVal);
      if (newVal !== null) {
        pushToHistory();
        setFmbData((prev) => {
          const updated = [...prev.outerLines];
          if (updated[index]) {
            updated[index] = { ...updated[index], dist: newVal };
          }
          return { ...prev, outerLines: updated };
        });
      }
    }
  };

  const renderSVGLineText = (text, p1, p2, isSelected, onClickHandler) => {
    let midX = (p1.x + p2.x) / 2;
    let midY = (p1.y + p2.y) / 2;
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    let nx = -dy / len;
    let ny = dx / len;

    let finalX = midX + nx * -12;
    let finalY = midY + ny * -12;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle > 90 || angle < -90) angle += 180;

    const displayStr = typeof text === 'number' ? text.toFixed(1) : (text || '');

    return (
      <text
        key={`line-text-${finalX}-${finalY}`}
        x={finalX}
        y={finalY}
        fill={isSelected ? '#dd6b20' : '#000000'}
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        cursor="pointer"
        onClick={onClickHandler}
        transform={`rotate(${angle}, ${finalX}, ${finalY})`}
      >
        {displayStr}
      </text>
    );
  };

  const renderSVGContent = () => {
    const st = fmbData;
    let linesSVG = [];
    let firlLinesSVG = [];
    let pointsSVG = [];
    let customLabelsSVG = [];

    // 1. Render Boundary Lines
    st.outerLines.forEach((line, idx) => {
      const p1 = st.outerPoints[line.p1Index];
      const p2 = st.outerPoints[line.p2Index];

      if (!p1 || !p2) return;

      let isLineSelected = selectedElement?.type === 'line' && selectedElement?.index === idx;

      linesSVG.push(
        <g key={`line-group-${idx}`}>
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={isLineSelected ? '#ed8936' : '#000000'}
            strokeWidth={isLineSelected ? '4' : '2.5'}
            cursor={activeTool === 'select' ? 'pointer' : 'default'}
            onClick={(e) => {
              if (activeTool === 'select') {
                e.stopPropagation();
                setSelectedElement({ type: 'line', index: idx });
              }
            }}
          />
          {renderSVGLineText(
            line.dist,
            p1,
            p2,
            isLineSelected,
            (e) => {
              if (activeTool === 'select') {
                e.stopPropagation();
                setSelectedElement({ type: 'line', index: idx });
              }
            }
          )}
        </g>
      );
    });

    // 2. Render FIRL Extension Direction Lines (Solid lines with NO end points or numbers)
    if (st.firlExtensions) {
      st.firlExtensions.forEach((ext, idx) => {
        const p1 = st.outerPoints[ext.p1Index];
        if (!p1) return;

        let isFirlSelected = selectedElement?.type === 'firl_extension' && selectedElement?.index === idx;

        firlLinesSVG.push(
          <line
            key={`firl-ext-${idx}`}
            x1={p1.x}
            y1={p1.y}
            x2={ext.x2}
            y2={ext.y2}
            stroke={isFirlSelected ? '#ed8936' : '#000000'}
            strokeWidth={isFirlSelected ? '4' : '2'}
            cursor={activeTool === 'select' ? 'pointer' : 'default'}
            onClick={(e) => {
              if (activeTool === 'select') {
                e.stopPropagation();
                setSelectedElement({ type: 'firl_extension', index: idx });
              }
            }}
          />
        );
      });
    }

    // 3. Render Boundary Points
    st.outerPoints.forEach((p, idx) => {
      let isActivePoint = activePointIndex === idx;
      let isFirlStart = firlStartPointIndex === idx;
      let isPointSelected = selectedElement?.type === 'point' && selectedElement?.index === idx;

      pointsSVG.push(
        <g key={`point-g-${idx}`} onClick={(e) => handlePointClick(idx, e)} className="cursor-pointer">
          {(isActivePoint || isPointSelected || isFirlStart) && (
            <circle
              cx={p.x}
              cy={p.y}
              r="11"
              fill="none"
              stroke={isFirlStart ? '#3182ce' : '#ed8936'}
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}
          <circle
            cx={p.x}
            cy={p.y}
            r={isActivePoint || isPointSelected || isFirlStart ? "7" : "5"}
            fill={isFirlStart ? '#3182ce' : (isActivePoint || isPointSelected ? '#ed8936' : '#2b6cb0')}
          />
        </g>
      );
    });

    // 4. Render Custom Text Labels
    st.customLabels.forEach((lbl, idx) => {
      let isLabelSelected = selectedElement?.type === 'label' && selectedElement?.index === idx;

      customLabelsSVG.push(
        <g key={`custom-label-g-${lbl.id || idx}`}>
          {isLabelSelected && (
            <rect
              x={lbl.x - 30}
              y={lbl.y - 14}
              width="60"
              height="28"
              fill="none"
              stroke="#ed8936"
              strokeWidth="2"
              strokeDasharray="3 3"
              rx="4"
            />
          )}
          <text
            x={lbl.x}
            y={lbl.y}
            fill={isLabelSelected ? '#dd6b20' : '#000000'}
            fontSize="13"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            cursor={activeTool === 'select' ? 'grab' : 'default'}
            onPointerDown={(e) => handleLabelDragStart(idx, e)}
            onTouchStart={(e) => handleLabelDragStart(idx, e)}
          >
            {lbl.text}
          </text>
        </g>
      );
    });

    return (
      <g>
        {firlLinesSVG}
        {linesSVG}
        {pointsSVG}
        {customLabelsSVG}
      </g>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="drawing-modal-overlay">
      <div className="drawing-modal-container">
        <div className="drawing-modal-header">
          <h3 className="drawing-modal-title">புல வரைபடம் வரைதல் (Draw Field Map)</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <div className="drawing-modal-body">
          <div className="drawing-toolbar">
            <button
              type="button"
              className={`tool-btn ${activeTool === 'draw' ? 'tool-btn-active' : ''}`}
              onClick={() => { setActiveTool('draw'); setSelectedElement(null); setFirlStartPointIndex(null); }}
            >
              ✏️ வரைபடம் (Draw)
            </button>
            <button
              type="button"
              className={`tool-btn ${activeTool === 'draw_firl' ? 'tool-btn-active' : ''}`}
              onClick={() => { setActiveTool('draw_firl'); setSelectedElement(null); setFirlStartPointIndex(null); }}
            >
              📏 FIRL கோடு (FIRL Extension)
            </button>
            <button
              type="button"
              className={`tool-btn ${activeTool === 'add_text' ? 'tool-btn-active' : ''}`}
              onClick={() => { setActiveTool('add_text'); setSelectedElement(null); setFirlStartPointIndex(null); }}
            >
              🔤 உரை (Add Text)
            </button>
            <button
              type="button"
              className={`tool-btn ${activeTool === 'select' ? 'tool-btn-active' : ''}`}
              onClick={() => { setActiveTool('select'); setFirlStartPointIndex(null); }}
            >
              🔍 தேர்வு / நகர்த்த (Select / Drag)
            </button>
            <button
              type="button"
              className="tool-btn btn-undo"
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              style={{ opacity: historyStack.length === 0 ? 0.5 : 1 }}
            >
              ↺ பின்செல்க (Undo)
            </button>
          </div>

          {/* Helper Banner for FIRL Extensions */}
          {activeTool === 'draw_firl' && (
            <div className="firl-hint-banner">
              ℹ️ FIRL கோடு வரைவதற்கு தொடங்கும் புள்ளியைக் கிளிக் செய்து, பின் திசையைக் கிளிக் செய்யவும்.
              {firlStartPointIndex !== null && <strong> — [தொடக்கப் புள்ளி தேர்வு செய்யப்பட்டது! திசையைக் கிளிக் செய்யவும்]</strong>}
            </div>
          )}

          {selectedElement && activeTool === 'select' && (
            <div className="selection-action-bar">
              <span className="selection-info">
                தேர்வு: <strong>{selectedElement.type.replace('_', ' ').toUpperCase()} #{selectedElement.index + 1}</strong>
              </span>
              <div>
                {(selectedElement.type === 'label' || selectedElement.type === 'line') && (
                  <button type="button" onClick={handleEditSelected} className="action-sub-btn edit-btn">
                    ✏️ திருத்து
                  </button>
                )}
                <button type="button" onClick={handleDeleteSelected} className="action-sub-btn delete-btn">
                  ❌ நீக்கு
                </button>
              </div>
            </div>
          )}

          <div className="svg-canvas-wrapper select-none">
            <svg
              ref={svgRef}
              width={PANEL_WIDTH}
              height={PANEL_HEIGHT}
              viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              onClick={handleCanvasInteraction}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="border border-slate-200 rounded shadow-inner bg-white block mx-auto relative touch-none"
              style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
            >
              {renderSVGContent()}
            </svg>
          </div>
        </div>

        <div className="drawing-modal-footer">
          <button type="button" onClick={handleResetDrawing} className="modal-footer-btn clear-btn">
            🗑️ Clear
          </button>
          <div className="footer-right-actions">
            <button type="button" onClick={onClose} className="modal-footer-btn cancel-btn">
              Cancel
            </button>
            <button type="button" onClick={handleSaveDrawing} className="modal-footer-btn save-btn">
              💾 Save
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .drawing-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 10px;
        }
        .drawing-modal-container {
          background: white;
          width: 100%;
          max-width: 620px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 95vh;
        }
        .drawing-modal-header {
          padding: 12px 16px;
          background-color: #2b6cb0;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawing-modal-title { margin: 0; font-size: 14px; font-weight: bold; }
        .modal-close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0 5px; }
        .drawing-modal-body { padding: 12px; overflow-y: auto; }
        .drawing-toolbar { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
        .tool-btn {
          flex: 1 1 15%;
          min-width: 60px;
          padding: 8px 4px;
          background-color: #edf2f7;
          color: #2d3748;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
          touch-action: manipulation;
          text-align: center;
        }
        .tool-btn-active {
          background-color: #3182ce !important;
          color: white !important;
          border-color: #2b6cb0 !important;
        }
        .btn-undo { background-color: #feebc8; color: #dd6b20; border-color: #fbd38d; }
        .btn-danger { background-color: #fff5f5; color: #e53e3e; border-color: #fed7d7; }
        .firl-hint-banner {
          background-color: #ebf8ff;
          border: 1px solid #bee3f8;
          color: #2b6cb0;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          margin-bottom: 8px;
        }
        .selection-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #fffaf0;
          border: 1px solid #feebc8;
          padding: 6px 10px;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .selection-info { font-size: 11px; color: #dd6b20; }
        .action-sub-btn {
          padding: 6px 10px;
          font-size: 11px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          border: none;
          margin-left: 4px;
          touch-action: manipulation;
        }
        .edit-btn { background-color: #3182ce; color: white; }
        .delete-btn { background-color: #e53e3e; color: white; }
        .svg-canvas-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8fafc;
          border-radius: 6px;
          padding: 4px;
        }
        .drawing-modal-footer {
          padding: 10px 16px;
          background-color: #f7fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-right-actions { display: flex; gap: 8px; }
        .modal-footer-btn {
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          border: none;
          touch-action: manipulation;
        }
        .clear-btn { background-color: #e53e3e; color: white; }
        .cancel-btn { background-color: #e2e8f0; color: #4a5568; }
        .save-btn { background-color: #ed8936; color: white; }

        @media (max-width: 480px) {
          .drawing-modal-container { width: 100%; height: 100%; max-height: 100vh; border-radius: 0; }
          .tool-btn { font-size: 10px; padding: 6px 2px; }
          .drawing-modal-body { padding: 8px; }
        }
      `}</style>
    </div>
  );
}