import React, { useState, useEffect, useRef } from 'react';

export default function FMBReportTool() {
  // --- Form & Page States ---
  const [applicantStatus, setApplicantStatus] = useState('satisfied');
  const [sigColor, setSigColor] = useState('blue');
  const [designation, setDesignation] = useState('');
  const [showDots, setShowDots] = useState(true);
  const [maxLength, setMaxLength] = useState(150);
  const [drawingMode, setDrawingMode] = useState('outer');

  // Editable fields state (Empty default values)
  const [office, setOffice] = useState('');
  const [reqNo, setReqNo] = useState('');
  const [date, setDate] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [survey, setSurvey] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [surveyDate, setSurveyDate] = useState('');

  // Signature data state
  const [signatures, setSignatures] = useState({
    vaor: null,
    surveyor: null,
    applicant: null,
    witness1: null,
    witness2: null,
  });

  // Modal State
  const [activeModal, setActiveModal] = useState({ isOpen: false, target: '', title: '' });

  // Canvas Refs
  const surveyCanvasRef = useRef(null);
  const modalCanvasRef = useRef(null);

  // Drawing Engine Mutable References
  const stateRef = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    outerPoints: [],
    innerPoints: [],
    innerLines: [],
    textLabels: [],
    frillExtensions: [],
    textPositions: [],
    isOuterClosed: false,
    activeCircle: null,
    selectedPointForLine: null,
    frillStartPoint: null,
    isMDrawing: false,
  });

  const BORDER_BUFFER = 20;

  useEffect(() => {
    initScale();
  }, [maxLength, showDots, drawingMode]);

  useEffect(() => {
    redrawAll();
  }, [showDots, drawingMode]);

  // --- Scale & Geometry Helpers ---
  const initScale = () => {
    const canvas = surveyCanvasRef.current;
    if (!canvas) return;
    const st = stateRef.current;
    let maxMeters = parseFloat(maxLength) || 150;

    if (!st.isOuterClosed) {
      let scaleX = (canvas.width - 60) / maxMeters;
      let scaleY = (canvas.height - 60) / maxMeters;
      st.scale = Math.min(scaleX, scaleY);

      st.offsetX = canvas.width / 2;
      st.offsetY = canvas.height / 2;

      if (st.outerPoints.length === 1) {
        st.outerPoints[0].x_raw = 0;
        st.outerPoints[0].y_raw = 0;
      }
      redrawAll();
      return;
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    st.outerPoints.forEach((p) => {
      if (p.x_raw < minX) minX = p.x_raw;
      if (p.x_raw > maxX) maxX = p.x_raw;
      if (p.y_raw < minY) minY = p.y_raw;
      if (p.y_raw > maxY) maxY = p.y_raw;
    });

    let fieldWidthMeters = maxX - minX || 10;
    let fieldHeightMeters = maxY - minY || 10;

    let totalRequiredWidth = fieldWidthMeters + BORDER_BUFFER * 2;
    let totalRequiredHeight = fieldHeightMeters + BORDER_BUFFER * 2;

    let scaleX = canvas.width / totalRequiredWidth;
    let scaleY = canvas.height / totalRequiredHeight;
    st.scale = Math.min(scaleX, scaleY);

    st.offsetX = (canvas.width - fieldWidthMeters * st.scale) / 2 - minX * st.scale;
    st.offsetY = (canvas.height - fieldHeightMeters * st.scale) / 2 - minY * st.scale;

    redrawAll();
  };

  const getSnappedCoords = (mx, my, circle) => {
    let angleRad = Math.atan2(my - circle.y_raw, mx - circle.x_raw);
    return {
      x: circle.x_raw + circle.radiusMeters * Math.cos(angleRad),
      y: circle.y_raw + circle.radiusMeters * Math.sin(angleRad),
    };
  };

  const findClosestPoint = (cx, cy) => {
    const st = stateRef.current;
    let allPoints = [...st.outerPoints, ...st.innerPoints];
    for (let p of allPoints) {
      let canvasX = p.x_raw * st.scale + st.offsetX;
      let canvasY = p.y_raw * st.scale + st.offsetY;
      if (Math.sqrt((cx - canvasX) ** 2 + (cy - canvasY) ** 2) < 20) return p;
    }
    return null;
  };

  const findClosestPointOnCanvasLines = (cx, cy, maxPixelTolerance) => {
    const st = stateRef.current;
    let minDist = Infinity;
    let closestPt = null;
    if (st.outerPoints.length < 2) return null;

    for (let i = 0; i < st.outerPoints.length; i++) {
      let p1 = st.outerPoints[i];
      let p2 = st.outerPoints[(i + 1) % st.outerPoints.length];
      if (!st.isOuterClosed && i === st.outerPoints.length - 1) break;

      let x1 = p1.x_raw * st.scale + st.offsetX;
      let y1 = p1.y_raw * st.scale + st.offsetY;
      let x2 = p2.x_raw * st.scale + st.offsetX;
      let y2 = p2.y_raw * st.scale + st.offsetY;

      let A = cx - x1; let B = cy - y1; let C = x2 - x1; let D = y2 - y1;
      let dot = A * C + B * D;
      let lenSq = C * C + D * D;
      let param = lenSq !== 0 ? dot / lenSq : -1;
      let xx, yy;

      if (param < 0) { xx = x1; yy = y1; }
      else if (param > 1) { xx = x2; yy = y2; }
      else { xx = x1 + param * C; yy = y1 + param * D; }

      let pixelDist = Math.sqrt((cx - xx) ** 2 + (cy - yy) ** 2);
      if (pixelDist < minDist && pixelDist < maxPixelTolerance) {
        minDist = pixelDist;
        let segLen = Math.sqrt(C * C + D * D);
        let curLen = Math.sqrt((xx - x1) ** 2 + (yy - y1) ** 2);
        closestPt = {
          x_raw: (xx - st.offsetX) / st.scale,
          y_raw: (yy - st.offsetY) / st.scale,
          edgeIdx: i,
          ratio: segLen > 0 ? curLen / segLen : 0,
        };
      }
    }
    return closestPt;
  };

  const findClosestPointOnInnerCanvasLines = (cx, cy, maxPixelTolerance) => {
    const st = stateRef.current;
    let minDist = Infinity;
    let closestPt = null;
    if (st.innerLines.length === 0) return null;

    for (let i = 0; i < st.innerLines.length; i++) {
      let p1 = st.innerLines[i].p1;
      let p2 = st.innerLines[i].p2;
      let x1 = p1.x_raw * st.scale + st.offsetX;
      let y1 = p1.y_raw * st.scale + st.offsetY;
      let x2 = p2.x_raw * st.scale + st.offsetX;
      let y2 = p2.y_raw * st.scale + st.offsetY;

      let A = cx - x1; let B = cy - y1; let C = x2 - x1; let D = y2 - y1;
      let dot = A * C + B * D;
      let lenSq = C * C + D * D;
      let param = lenSq !== 0 ? dot / lenSq : -1;
      let xx, yy;

      if (param < 0) { xx = x1; yy = y1; }
      else if (param > 1) { xx = x2; yy = y2; }
      else { xx = x1 + param * C; yy = y1 + param * D; }

      let pixelDist = Math.sqrt((cx - xx) ** 2 + (cy - yy) ** 2);
      if (pixelDist < minDist && pixelDist < maxPixelTolerance) {
        minDist = pixelDist;
        let segLen = Math.sqrt(C * C + D * D);
        let curLen = Math.sqrt((xx - x1) ** 2 + (yy - y1) ** 2);
        closestPt = {
          x_raw: (xx - st.offsetX) / st.scale,
          y_raw: (yy - st.offsetY) / st.scale,
          lineIdx: i,
          ratio: segLen > 0 ? curLen / segLen : 0,
        };
      }
    }
    return closestPt;
  };

  const askForRadius = (centerX, centerY, mode, sourcePoint = null) => {
    setTimeout(() => {
      let userInput = prompt("புள்ளிக்கான தூரம் மீட்டரில் (0.0 வடிவம்):");
      let distance = parseFloat(userInput);
      if (userInput === null) return;
      if (isNaN(distance) || distance <= 0) {
        alert("சரியான தூரத்தை உள்ளிடவும்!");
        askForRadius(centerX, centerY, mode, sourcePoint);
        return;
      }

      stateRef.current.activeCircle = {
        x_raw: centerX,
        y_raw: centerY,
        radiusMeters: distance,
        distanceMeter: parseFloat(distance.toFixed(1)),
        fromPoint: sourcePoint,
      };
      redrawAll();
    }, 50);
  };

  // --- Main Canvas Drawing Redraw ---
  const redrawAll = () => {
    const canvas = surveyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    st.textPositions = [];

    if (st.outerPoints.length > 0) {
      let sumX = 0, sumY = 0;
      st.outerPoints.forEach((p) => { sumX += p.x_raw; sumY += p.y_raw; });
      let polyCenterX = (sumX / st.outerPoints.length) * st.scale + st.offsetX;
      let polyCenterY = (sumY / st.outerPoints.length) * st.scale + st.offsetY;

      for (let i = 0; i < st.outerPoints.length; i++) {
        let p1 = st.outerPoints[i];
        let p2 = st.outerPoints[(i + 1) % st.outerPoints.length];
        if (!st.isOuterClosed && i === st.outerPoints.length - 1) break;

        let edgesPoints = st.innerPoints.filter((ip) => ip.isOnEdge && ip.edgeIdx === i);
        if (!showDots) {
          edgesPoints = edgesPoints.filter((ep) => {
            let attachedToLine = st.innerLines.some(
              (line) =>
                Math.sqrt((line.p1.x_raw - ep.x_raw) ** 2 + (line.p1.y_raw - ep.y_raw) ** 2) < 0.05 ||
                Math.sqrt((line.p2.x_raw - ep.x_raw) ** 2 + (line.p2.y_raw - ep.y_raw) ** 2) < 0.05
            );
            let attachedToFrill = st.frillExtensions.some(
              (ext) => Math.sqrt((ext.x1_raw - ep.x_raw) ** 2 + (ext.y1_raw - ep.y_raw) ** 2) < 0.05
            );
            return attachedToLine || attachedToFrill;
          });
        }
        edgesPoints.sort((a, b) => a.ratio - b.ratio);

        let x1_c = p1.x_raw * st.scale + st.offsetX;
        let y1_c = p1.y_raw * st.scale + st.offsetY;
        let x2_c = p2.x_raw * st.scale + st.offsetX;
        let y2_c = p2.y_raw * st.scale + st.offsetY;

        ctx.beginPath();
        ctx.moveTo(x1_c, y1_c);
        ctx.lineTo(x2_c, y2_c);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        let fullDistText = p2.customDist || p2.dist.toFixed(1);
        if (i === 0 && st.isOuterClosed && !p2.customDist) {
          let dPx = Math.sqrt((p1.x_raw - p2.x_raw) ** 2 + (p1.y_raw - p2.y_raw) ** 2);
          fullDistText = parseFloat(dPx.toFixed(1)).toFixed(1);
        }

        let midX = (x1_c + x2_c) / 2;
        let midY = (y1_c + y2_c) / 2;

        if (edgesPoints.length === 0) {
          st.textPositions.push({ x: midX, y: midY, currentText: fullDistText, ref: p2 });
          drawTextOffsetFixed(ctx, fullDistText, x1_c, y1_c, x2_c, y2_c, polyCenterX, polyCenterY, true, '#000000');
        }

        if (edgesPoints.length > 0) {
          let currentPt = p1;
          for (let j = 0; j <= edgesPoints.length; j++) {
            let nextPt = j === edgesPoints.length ? p2 : edgesPoints[j];
            let partDistText = nextPt.customDistPart;
            if (!partDistText) {
              let partPx = Math.sqrt((nextPt.x_raw - currentPt.x_raw) ** 2 + (nextPt.y_raw - currentPt.y_raw) ** 2);
              partDistText = parseFloat(partPx.toFixed(1)).toFixed(1);
            }

            let cx1 = currentPt.x_raw * st.scale + st.offsetX;
            let cy1 = currentPt.y_raw * st.scale + st.offsetY;
            let cx2 = nextPt.x_raw * st.scale + st.offsetX;
            let cy2 = nextPt.y_raw * st.scale + st.offsetY;

            let midX_I = (cx1 + cx2) / 2;
            let midY_I = (cy1 + cy2) / 2;
            st.textPositions.push({
              x: midX_I,
              y: midY_I,
              currentText: partDistText,
              ref: {
                get customDist() { return nextPt.customDistPart; },
                set customDist(v) { nextPt.customDistPart = v; },
              },
            });

            drawTextOffsetFixed(ctx, partDistText, cx1, cy1, cx2, cy2, polyCenterX, polyCenterY, true, '#000000');
            currentPt = nextPt;
          }
        }
      }

      if (!st.isOuterClosed && st.outerPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(st.outerPoints[0].x_raw * st.scale + st.offsetX, st.outerPoints[0].y_raw * st.scale + st.offsetY);
        for (let k = 1; k < st.outerPoints.length; k++) {
          ctx.lineTo(st.outerPoints[k].x_raw * st.scale + st.offsetX, st.outerPoints[k].y_raw * st.scale + st.offsetY);
        }
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        for (let k = 1; k < st.outerPoints.length; k++) {
          let prev = st.outerPoints[k - 1];
          let curr = st.outerPoints[k];
          let openDistText = curr.customDist || curr.dist.toFixed(1);

          let cx1 = prev.x_raw * st.scale + st.offsetX;
          let cy1 = prev.y_raw * st.scale + st.offsetY;
          let cx2 = curr.x_raw * st.scale + st.offsetX;
          let cy2 = curr.y_raw * st.scale + st.offsetY;

          let midX_Op = (cx1 + cx2) / 2;
          let midY_Op = (cy1 + cy2) / 2;
          st.textPositions.push({ x: midX_Op, y: midY_Op, currentText: openDistText, ref: curr });
          drawTextOffsetFixed(ctx, openDistText, cx1, cy1, cx2, cy2, polyCenterX, polyCenterY, true, '#000000');
        }
      }

      if (showDots) {
        st.outerPoints.forEach((p) => {
          ctx.fillStyle = '#2b6cb0';
          ctx.beginPath();
          ctx.arc(p.x_raw * st.scale + st.offsetX, p.y_raw * st.scale + st.offsetY, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }

    st.innerLines.forEach((line, idx) => {
      let lx1 = line.p1.x_raw * st.scale + st.offsetX;
      let ly1 = line.p1.y_raw * st.scale + st.offsetY;
      let lx2 = line.p2.x_raw * st.scale + st.offsetX;
      let ly2 = line.p2.y_raw * st.scale + st.offsetY;

      let linePoints = st.innerPoints.filter((ip) => ip.isOnInnerLine && ip.innerLineIdx === idx);
      if (!showDots) {
        linePoints = linePoints.filter((lp) =>
          st.innerLines.some(
            (otherLine, oIdx) =>
              idx !== oIdx &&
              (Math.sqrt((otherLine.p1.x_raw - lp.x_raw) ** 2 + (otherLine.p1.y_raw - lp.y_raw) ** 2) < 0.05 ||
                Math.sqrt((otherLine.p2.x_raw - lp.x_raw) ** 2 + (otherLine.p2.y_raw - lp.y_raw) ** 2) < 0.05)
          )
        );
      }
      linePoints.sort((a, b) => a.ratio - b.ratio);

      ctx.beginPath();
      ctx.moveTo(lx1, ly1);
      ctx.lineTo(lx2, ly2);
      ctx.strokeStyle = '#e53e3e';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      let innerLineText = line.customDist || parseFloat(line.dist).toFixed(1);
      let midX_IL = (lx1 + lx2) / 2;
      let midY_IL = (ly1 + ly2) / 2;
      st.textPositions.push({ x: midX_IL, y: midY_IL, currentText: innerLineText, ref: line });

      if (linePoints.length === 0) {
        drawTextAlongLine(ctx, innerLineText, lx1, ly1, lx2, ly2, '#000000');
      } else {
        let currentPt = line.p1;
        for (let j = 0; j <= linePoints.length; j++) {
          let nextPt = j === linePoints.length ? line.p2 : linePoints[j];
          let partDistText = nextPt.customSubLineDist;
          if (!partDistText) {
            let partPx = Math.sqrt((nextPt.x_raw - currentPt.x_raw) ** 2 + (nextPt.y_raw - currentPt.y_raw) ** 2);
            partDistText = parseFloat(partPx.toFixed(1)).toFixed(1);
          }

          let cx1 = currentPt.x_raw * st.scale + st.offsetX;
          let cy1 = currentPt.y_raw * st.scale + st.offsetY;
          let cx2 = nextPt.x_raw * st.scale + st.offsetX;
          let cy2 = nextPt.y_raw * st.scale + st.offsetY;
          let mx_sub = (cx1 + cx2) / 2;
          let my_sub = (cy1 + cy2) / 2;

          st.textPositions.push({
            x: mx_sub,
            y: my_sub,
            currentText: partDistText,
            ref: {
              get customDist() { return nextPt.customSubLineDist; },
              set customDist(v) { nextPt.customSubLineDist = v; },
            },
          });
          drawTextAlongLine(ctx, partDistText, cx1, cy1, cx2, cy2, '#000000');
          currentPt = nextPt;
        }
      }
    });

    st.frillExtensions.forEach((ext) => {
      ctx.beginPath();
      ctx.moveTo(ext.x1_raw * st.scale + st.offsetX, ext.y1_raw * st.scale + st.offsetY);
      ctx.lineTo(ext.x2_raw * st.scale + st.offsetX, ext.y2_raw * st.scale + st.offsetY);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    st.textLabels.forEach((lbl) => {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Arial, Tamil';
      ctx.textAlign = 'center';
      ctx.fillText(lbl.text, lbl.x_raw * st.scale + st.offsetX, lbl.y_raw * st.scale + st.offsetY);
    });

    if (showDots) {
      st.innerPoints.forEach((p) => {
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.arc(p.x_raw * st.scale + st.offsetX, p.y_raw * st.scale + st.offsetY, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    if (st.selectedPointForLine && showDots) {
      ctx.strokeStyle = '#ed8936';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(st.selectedPointForLine.x_raw * st.scale + st.offsetX, st.selectedPointForLine.y_raw * st.scale + st.offsetY, 10, 0, 2 * Math.PI);
      ctx.stroke();
    }

    if (st.activeCircle && showDots) {
      let cx = st.activeCircle.x_raw * st.scale + st.offsetX;
      let cy = st.activeCircle.y_raw * st.scale + st.offsetY;
      let cr = st.activeCircle.radiusMeters * st.scale;

      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, 2 * Math.PI);
      ctx.strokeStyle = '#48bb78';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        let angleRad = (i * 45 * Math.PI) / 180;
        let lineX = cx + cr * Math.cos(angleRad);
        let lineY = cy + cr * Math.sin(angleRad);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(lineX, lineY);
        ctx.strokeStyle = 'rgba(72, 187, 120, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  const drawTextAlongLine = (ctx, text, x1, y1, x2, y2, colorStr) => {
    let midX = (x1 + x2) / 2;
    let midY = (y1 + y2) / 2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    ctx.save();
    ctx.fillStyle = colorStr;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(midX, midY - 7);
    let angle = Math.atan2(dy, dx);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;
    ctx.rotate(angle);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const drawTextOffsetFixed = (ctx, text, x1, y1, x2, y2, centerX, centerY, wantOuter, colorStr) => {
    let midX = (x1 + x2) / 2;
    let midY = (y1 + y2) / 2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    let nx = -dy / len;
    let ny = dx / len;
    let toCenterDx = centerX - midX;
    let toCenterDy = centerY - midY;
    let dotProduct = toCenterDx * nx + toCenterDy * ny;

    if (dotProduct < 0) { nx = -nx; ny = -ny; }

    let distOffset = wantOuter ? -14 : 14;
    let finalX = midX + nx * distOffset;
    let finalY = midY + ny * distOffset;

    ctx.save();
    ctx.fillStyle = colorStr;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(finalX, finalY);
    let angle = Math.atan2(dy, dx);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;
    ctx.rotate(angle);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  // --- Canvas Click Handling ---
  const handleCanvasClick = (e) => {
    const canvas = surveyCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const st = stateRef.current;

    if (drawingMode === 'edit_meas') {
      let clickedText = st.textPositions.find(
        (pos) => Math.sqrt((pos.x - clickX) ** 2 + (pos.y - clickY) ** 2) < 25
      );
      if (clickedText) {
        setTimeout(() => {
          let newVal = prompt('அளவை மாற்றியமைக்கவும்:', clickedText.ref.customDist || clickedText.currentText);
          if (newVal !== null) {
            clickedText.ref.customDist = newVal;
            redrawAll();
          }
        }, 50);
      } else {
        alert('மாற்ற வேண்டிய அளவின் (Measurement Text) மீது சரியாகத் தொடவும்!');
      }
      return;
    }

    if (drawingMode === 'frill_draw') {
      if (!st.frillStartPoint) {
        let clickedPt = findClosestPoint(clickX, clickY);
        let edgePt = findClosestPointOnCanvasLines(clickX, clickY, 35);

        if (!clickedPt && edgePt) {
          let newPointLabel = 'IP' + (st.innerPoints.length + 1);
          clickedPt = {
            x_raw: edgePt.x_raw,
            y_raw: edgePt.y_raw,
            label: newPointLabel,
            dist: 0,
            fromPoint: null,
            isOnEdge: true,
            edgeIdx: edgePt.edgeIdx,
            ratio: edgePt.ratio,
            isOnInnerLine: false,
            innerLineIdx: -1,
          };
          st.innerPoints.push(clickedPt);
        }

        if (clickedPt) {
          st.frillStartPoint = clickedPt;
          redrawAll();
        } else {
          alert('எக்ஸ்டென்ஷன் கோடு துவங்க அவுட்டர் கறுப்புக் கோட்டின் மீது கிளிக் செய்யவும்!');
        }
      } else {
        let mouseX = (clickX - st.offsetX) / st.scale;
        let mouseY = (clickY - st.offsetY) / st.scale;
        st.frillExtensions.push({
          x1_raw: st.frillStartPoint.x_raw,
          y1_raw: st.frillStartPoint.y_raw,
          x2_raw: mouseX,
          y2_raw: mouseY,
        });
        st.frillStartPoint = null;
        redrawAll();
      }
      return;
    }

    let mouseX = (clickX - st.offsetX) / st.scale;
    let mouseY = (clickY - st.offsetY) / st.scale;

    if (drawingMode === 'outer') {
      if (st.isOuterClosed) return;
      if (st.outerPoints.length === 0) {
        st.outerPoints.push({ x_raw: 0, y_raw: 0, dist: 0 });
        initScale();
        askForRadius(0, 0, 'outer');
      } else if (st.activeCircle) {
        let snapped = getSnappedCoords(mouseX, mouseY, st.activeCircle);
        st.outerPoints.push({ x_raw: snapped.x, y_raw: snapped.y, dist: st.activeCircle.distanceMeter });
        st.activeCircle = null;
        initScale();
        askForRadius(snapped.x, snapped.y, 'outer');
      }
    } else if (drawingMode === 'inner_point') {
      if (st.activeCircle) {
        let snapped = getSnappedCoords(mouseX, mouseY, st.activeCircle);
        let newPointLabel = 'IP' + (st.innerPoints.length + 1);

        let edgePt = findClosestPointOnCanvasLines(snapped.x * st.scale + st.offsetX, snapped.y * st.scale + st.offsetY, 30);
        let innerLinePt = findClosestPointOnInnerCanvasLines(snapped.x * st.scale + st.offsetX, snapped.y * st.scale + st.offsetY, 30);

        let onEdge = false; let edgeIdx = -1; let ratio = 0;
        let onInnerLine = false; let innerLineIdx = -1;

        if (edgePt) {
          snapped.x = edgePt.x_raw;
          snapped.y = edgePt.y_raw;
          onEdge = true;
          edgeIdx = edgePt.edgeIdx;
          ratio = edgePt.ratio;
        } else if (innerLinePt) {
          snapped.x = innerLinePt.x_raw;
          snapped.y = innerLinePt.y_raw;
          onInnerLine = true;
          innerLineIdx = innerLinePt.lineIdx;
          ratio = innerLinePt.ratio;
        }

        st.innerPoints.push({
          x_raw: snapped.x,
          y_raw: snapped.y,
          label: newPointLabel,
          dist: st.activeCircle.distanceMeter,
          fromPoint: st.activeCircle.fromPoint,
          isOnEdge: onEdge,
          edgeIdx: edgeIdx,
          ratio: ratio,
          isOnInnerLine: onInnerLine,
          innerLineIdx: innerLineIdx,
        });
        st.activeCircle = null;
        redrawAll();
      } else {
        let clickedPt = findClosestPoint(clickX, clickY);
        if (clickedPt) {
          askForRadius(clickedPt.x_raw, clickedPt.y_raw, 'inner_point', clickedPt);
        } else {
          let edgePt = findClosestPointOnCanvasLines(clickX, clickY, 35);
          let innerLinePt = findClosestPointOnInnerCanvasLines(clickX, clickY, 35);
          if (edgePt) {
            askForRadius(edgePt.x_raw, edgePt.y_raw, 'inner_point', edgePt);
          } else if (innerLinePt) {
            askForRadius(innerLinePt.x_raw, innerLinePt.y_raw, 'inner_point', innerLinePt);
          }
        }
      }
    } else if (drawingMode === 'inner_line') {
      let clickedPt = findClosestPoint(clickX, clickY);
      if (!clickedPt) {
        let edgePt = findClosestPointOnCanvasLines(clickX, clickY, 35);
        let innerLinePt = findClosestPointOnInnerCanvasLines(clickX, clickY, 35);
        if (edgePt) clickedPt = { x_raw: edgePt.x_raw, y_raw: edgePt.y_raw };
        else if (innerLinePt) clickedPt = { x_raw: innerLinePt.x_raw, y_raw: innerLinePt.y_raw };
      }
      if (!clickedPt) return;

      if (!st.selectedPointForLine) {
        st.selectedPointForLine = clickedPt;
        redrawAll();
      } else {
        if (st.selectedPointForLine.x_raw !== clickedPt.x_raw || st.selectedPointForLine.y_raw !== clickedPt.y_raw) {
          let dPx = Math.sqrt(
            (st.selectedPointForLine.x_raw - clickedPt.x_raw) ** 2 +
              (st.selectedPointForLine.y_raw - clickedPt.y_raw) ** 2
          );
          st.innerLines.push({
            p1: st.selectedPointForLine,
            p2: clickedPt,
            dist: parseFloat(dPx.toFixed(1)),
            isFrillLine: false,
          });
        }
        st.selectedPointForLine = null;
        redrawAll();
      }
    } else if (drawingMode === 'adj_text') {
      setTimeout(() => {
        let txt = prompt('பக்கத்து புல எண்ணை டைப் செய்யவும் (எ.கா: 125/2B):');
        if (txt) {
          st.textLabels.push({ x_raw: mouseX, y_raw: mouseY, text: txt });
          redrawAll();
        }
      }, 50);
    }
  };

  // --- Controls Handlers ---
  const handleModeChange = (e) => {
    let newMode = e.target.value;
    const st = stateRef.current;
    if (
      ['inner_point', 'inner_line', 'frill_draw', 'adj_text', 'edit_meas'].includes(newMode) &&
      !st.isOuterClosed
    ) {
      alert('முதலில் வெளிப்புற எல்லையை முடித்துவிட்டு உட்பிரிவுக்கு வரவும்!');
      setDrawingMode('outer');
      return;
    }
    setDrawingMode(newMode);
    st.activeCircle = null;
    st.selectedPointForLine = null;
    st.frillStartPoint = null;
    redrawAll();
  };

  const closeOuterBoundary = () => {
    const st = stateRef.current;
    if (st.outerPoints.length < 3) {
      alert('எல்லையை மூட குறைந்தபட்சம் 3 புள்ளிகள் தேவை!');
      return;
    }
    st.isOuterClosed = true;
    st.activeCircle = null;
    let p1 = st.outerPoints[st.outerPoints.length - 1];
    let p2 = st.outerPoints[0];
    let dPx = Math.sqrt((p1.x_raw - p2.x_raw) ** 2 + (p1.y_raw - p2.y_raw) ** 2);
    p2.dist = parseFloat(dPx.toFixed(1));
    initScale();
    setDrawingMode('inner_point');
  };

  const undoLastAction = () => {
    const st = stateRef.current;
    if (drawingMode === 'outer') {
      if (st.isOuterClosed) st.isOuterClosed = false;
      else st.outerPoints.pop();
      initScale();
    } else if (drawingMode === 'inner_point') {
      if (st.activeCircle) st.activeCircle = null;
      else st.innerPoints.pop();
      redrawAll();
    } else if (drawingMode === 'inner_line') {
      st.innerLines.pop();
      redrawAll();
    } else if (drawingMode === 'frill_draw') {
      st.frillStartPoint = null;
      let lastFrill = st.frillExtensions.pop();
      if (lastFrill) {
        st.innerPoints = st.innerPoints.filter(
          (ip) => !(Math.sqrt((ip.x_raw - lastFrill.x1_raw) ** 2 + (ip.y_raw - lastFrill.y1_raw) ** 2) < 0.01)
        );
      }
      redrawAll();
    } else if (drawingMode === 'adj_text') {
      st.textLabels.pop();
      redrawAll();
    }
    st.selectedPointForLine = null;
    redrawAll();
  };

  const resetCanvas = () => {
    const st = stateRef.current;
    st.outerPoints = [];
    st.innerPoints = [];
    st.innerLines = [];
    st.frillExtensions = [];
    st.textLabels = [];
    st.textPositions = [];
    st.isOuterClosed = false;
    st.activeCircle = null;
    st.selectedPointForLine = null;
    st.frillStartPoint = null;
    setShowDots(true);
    setDrawingMode('outer');
    initScale();
  };

  // --- Signature Modal & Canvas Events ---
  const openSignatureModal = (target, titleText) => {
    setActiveModal({ isOpen: true, target, title: titleText });
  };

  const closeSignatureModal = () => {
    setActiveModal({ isOpen: false, target: '', title: '' });
  };

  const clearModalCanvas = () => {
    const canvas = modalCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = modalCanvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      setSignatures((prev) => ({ ...prev, [activeModal.target]: dataURL }));
    }
    closeSignatureModal();
  };

  // Modal drawing listeners
  const startModalDrawing = (e) => {
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    stateRef.current.isMDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawModal = (e) => {
    if (!stateRef.current.isMDrawing) return;
    const canvas = modalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = sigColor === 'blue' ? '#0000ff' : '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const stopModalDrawing = () => {
    stateRef.current.isMDrawing = false;
  };

  const printFMBFinalPDF = () => {
    let originalTitle = document.title;
    document.title = "F Line Statement " + (survey ? survey.replace('/', '|') : ' ('+date+')');
    window.print();
    document.title = originalTitle;
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: '#f0f4f8',
        margin: 0,
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Dynamic CSS Injection targeting sibling components across the DOM */}
      <style>
        {`
          @media print {
            /* Hide all body elements by default */
            body * {
              visibility: hidden !important;
            }

            /* Make ONLY the printable document container and its children visible */
            .printable-document-container,
            .printable-document-container * {
              visibility: visible !important;
            }

            /* Position the printable area at the absolute top-left of the paper */
            .printable-document-container {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding-left: 10% !important;
              padding-right:0 !important;
              border: none !important;
              box-shadow: none !important;
            }

            /* Extra cleanup inside the printable document */
            .no-print {
              display: none !important;
            }

            .editable-span {
              border: none !important;
              background: transparent !important;
              padding: 0 !important;
            }

            .editable-select {
              border: none !important;
              background: transparent !important;
              appearance: none !important;
              -webkit-appearance: none !important;
              padding: 0 !important;
            }

            .sig-display-pad, .witness-pad {
              border: none !important;
              background: transparent !important;
            }

            .sig-placeholder-text {
              display: none !important;
            }

            canvas {
              border: none !important;
            }

        }
          }
        `}
      </style>

      {/* Top Controls Box */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          boxSizing: 'border-box',
          marginBottom: '15px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ebf8ff',
            padding: '12px',
            border: '1px solid #bee3f8',
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          <label style={{ color: '#2b6cb0', fontSize: '14px', display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            மனுதாரரின் நிலை (Applicant Status):
          </label>
          <select
            value={applicantStatus}
            onChange={(e) => setApplicantStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #3182ce',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxSizing: 'border-box',
            }}
          >
            <option value="satisfied">1. திருப்தி அடைந்தார் (Satisfied - With Sketch)</option>
            <option value="not_satisfied">2. திருப்தி அடையவில்லை (Not Satisfied - No Sketch)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>
          <span>பேனா மை வண்ணம் (Signature Color):</span>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name="sigColor"
              value="blue"
              checked={sigColor === 'blue'}
              onChange={() => setSigColor('blue')}
              style={{ width: 'auto', marginRight: '4px' }}
            />{' '}
            நீலம் (Blue)
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name="sigColor"
              value="black"
              checked={sigColor === 'black'}
              onChange={() => setSigColor('black')}
              style={{ width: 'auto', marginRight: '4px' }}
            />{' '}
            கருப்பு (Black)
          </label>
        </div>

        <button
          onClick={printFMBFinalPDF}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ed8936',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          அறிக்கையை PDF ஆக டவுன்லோடு செய்ய (Download PDF)
        </button>
      </div>

      {/* Main Printed Document Container (Targeted for printing) */}
      <div
        className="printable-document-container a4-page"
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '600px',
          minHeight: '842px',
          border: '2px solid #2b6cb0',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
          padding: '25px',
          marginBottom: '20px',
        }}
      >
        {/* Report Statement Section */}
        <div
          style={{
            boxSizing: 'border-box',
            fontSize: '14px',
            lineHeight: '2.2',
            color: '#000000',
            paddingBottom: '20px',
            textAlign: 'justify',
            borderBottom: applicantStatus === 'satisfied' ? '2px dashed #2b6cb0' : 'none',
          }}
        >
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', textDecoration: 'underline', marginBottom: '20px', color: '#000000' }}>
            குறுவட்ட அளவரின் அறிக்கை / மனுதாரரின் வாக்குமூலம்
          </div>

          <div>
            வட்டார/வட்டாட்சியர் அலுவலகம்:{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setOffice(e.target.innerText)}
              style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '80px' }}
            >
              {' '+office+' '}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '5px' }}>
            <div>
              புல எல்லை மனு எண்:{' '}
              <span
                className="editable-span"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setReqNo(e.target.innerText)}
                style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '60px' }}
              >
                {' '+reqNo+' '}
              </span>
            </div>
            <div>
              நாள்:{' '}
              <span
                className="editable-span"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setDate(e.target.innerText)}
                style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '60px' }}
              >
                {' '+date+' '}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '8px', textAlign: 'justify' }}>
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setDistrict(e.target.innerText)}
              style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '60px' }}
            >
              {' '+district+' '}
            </span>{' '}
            மாவட்டம்,{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setTaluk(e.target.innerText)}
              style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '60px' }}
            >
              {' '+taluk+' '}
            </span>{' '}
            வட்டம்,{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setVillage(e.target.innerText)}
              style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '60px' }}
            >
              {' '+village+' '}
            </span>{' '}
            கிராமம், புல எண்:{' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setSurvey(e.target.innerText)}
              style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '60px' }}
            >
              {' '+survey+' '}
            </span>
            -ன் புல எல்லைகளை அளக்கக் கோரி நான் (திரு / திருமதி){' '}
            <span
              className="editable-span"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setApplicantName(e.target.innerText)}
              style={{ borderBottom: '1px dotted #000000', fontWeight: 'bold', color: '#000000', backgroundColor: '#f7fafc', padding: '0px 4px', display: 'inline', outline: 'none', minWidth: '80px' }}
            >
              {' '+applicantName+' '}
            </span>{' '}
            மனு சமர்ப்பித்ததை முன்னிட்டு இன்று ({' '+date+' '}) 
           {' '}
            <select
              className="editable-select"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              style={{
                border: 'none',
                borderBottom: '1px dotted #000000',
                fontWeight: 'bold',
                color: '#000000',
                backgroundColor: '#f7fafc',
                padding: '0px 2px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                width: 'auto',
              }}
            >
              <option value="">--தேர்ந்தெடுக்கவும்--</option>
              <option value="குறுவட்ட நிலஅளவர்">குறுவட்ட நிலஅளவர்</option>
              <option value="நிலஅளவர்">நிலஅளவர்</option>
              <option value="சார் ஆய்வாளர்">சார் ஆய்வாளர்</option>
            </select>{' '}
            <span>
              {applicantStatus === 'satisfied'
                ? 'புலத்தின் எல்லைகளை அளந்து காண்பித்தார். அப்போது நான் உடன் இருந்து எனது புல எல்லைகளை தெரிந்து கொண்டேன்.'
                : 'புலத்தின் எல்லைகளை அளந்து காண்பித்தார். அளவையில் எனக்கு திருப்தி இல்லை என்பதை தெரிவித்துக் கொள்கிறேன்.'}
            </span>
          </div>

          {/* Signature Grid */}
          <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center', width: '32%', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000000' }}>
              <div
                className="sig-display-pad"
                onClick={() => openSignatureModal('vaor', 'கி.நி. அலுவலர் (கிராம நிர்வாக அலுவலர்)')}
                style={{
                  border: '1px solid #cbd5e0',
                  backgroundColor: '#fafafa',
                  width: '100%',
                  height: '60px',
                  marginBottom: '5px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {signatures.vaor ? (
                  <img src={signatures.vaor} alt="VAO Sig" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span className="sig-placeholder-text" style={{ fontSize: '10px', color: '#a0aec0', fontWeight: 'bold' }}>கையெழுத்திட கிளிக் செய்க</span>
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: '1.4', color: '#000000' }}>
                கி.நி. அலுவலர்<br />(கிராம நிர்வாக அலுவலர்)
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '32%', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000000' }}>
              <div
                className="sig-display-pad"
                onClick={() => openSignatureModal('surveyor', 'அளவர் கையொப்பம்')}
                style={{
                  border: '1px solid #cbd5e0',
                  backgroundColor: '#fafafa',
                  width: '100%',
                  height: '60px',
                  marginBottom: '5px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {signatures.surveyor ? (
                  <img src={signatures.surveyor} alt="Surveyor Sig" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span className="sig-placeholder-text" style={{ fontSize: '10px', color: '#a0aec0', fontWeight: 'bold' }}>கையெழுத்திட கிளிக் செய்க</span>
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: '1.4', color: '#000000' }}>
                என் முன்பாக<br />({designation || '________'})
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '32%', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000000' }}>
              <div
                className="sig-display-pad"
                onClick={() => openSignatureModal('applicant', 'மனுதாரர் கையொப்பம்')}
                style={{
                  border: '1px solid #cbd5e0',
                  backgroundColor: '#fafafa',
                  width: '100%',
                  height: '60px',
                  marginBottom: '5px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {signatures.applicant ? (
                  <img src={signatures.applicant} alt="Applicant Sig" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span className="sig-placeholder-text" style={{ fontSize: '10px', color: '#a0aec0', fontWeight: 'bold' }}>கையெழுத்திட கிளிக் செய்க</span>
                )}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: '1.4', color: '#000000' }}>
                <br />மனுதாரர் கையொப்பம்
              </div>
            </div>
          </div>

          {/* Witness Section */}
          <div style={{ marginTop: '20px', fontSize: '13px', fontWeight: 'bold', color: '#000000' }}>
            சாட்சிகளின் கையொப்பம்:<br />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ width: '48%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div
                  className="witness-pad"
                  onClick={() => openSignatureModal('witness1', 'சாட்சி 1 கையொப்பம்')}
                  style={{
                    borderBottom: '1px solid #000000',
                    width: '100%',
                    height: '45px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {signatures.witness1 ? (
                    <img src={signatures.witness1} alt="Witness 1" style={{ height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span className="sig-placeholder-text" style={{ fontSize: '11px', color: '#a0aec0', fontWeight: 'normal' }}>1. கையெழுத்திட கிளிக் செய்க</span>
                  )}
                </div>
              </div>
              <div style={{ width: '48%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div
                  className="witness-pad"
                  onClick={() => openSignatureModal('witness2', 'சாட்சி 2 கையொப்பம்')}
                  style={{
                    borderBottom: '1px solid #000000',
                    width: '100%',
                    height: '45px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {signatures.witness2 ? (
                    <img src={signatures.witness2} alt="Witness 2" style={{ height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span className="sig-placeholder-text" style={{ fontSize: '11px', color: '#a0aec0', fontWeight: 'normal' }}>2. கையெழுத்திட கிளிக் செய்க</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Drawing Print Block */}
        {applicantStatus === 'satisfied' && (
          <div style={{ position: 'relative', boxSizing: 'border-box', paddingTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>
              <div>மாவட்டம்: <span style={{ borderBottom: '1px solid #000', padding: '0 5px', minWidth: '40px', display: 'inline-block' }}>{district}</span></div>
              <div>வட்டம்: <span style={{ borderBottom: '1px solid #000', padding: '0 5px', minWidth: '40px', display: 'inline-block' }}>{taluk}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>
              <div>கிராமம்: <span style={{ borderBottom: '1px solid #000', padding: '0 5px', minWidth: '40px', display: 'inline-block' }}>{village}</span></div>
              <div>புல எண்/உட்பிரிவு எண்: <span style={{ borderBottom: '1px solid #000', padding: '0 5px', minWidth: '40px', display: 'inline-block' }}>{survey}</span></div>
            </div> */}

            <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={surveyCanvasRef}
                width={560}
                height={340}
                onClick={handleCanvasClick}
                style={{ border: '1px solid #cbd5e0', cursor: 'crosshair', backgroundColor: '#fff' }}
              />
              <div style={{ position: 'absolute', top: '10px', right: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
                <svg width="25" height="35" viewBox="0 0 30 40">
                  <line x1="15" y1="35" x2="15" y2="5" stroke="black" strokeWidth="2" />
                  <polyline points="10,12 15,5 20,12" fill="none" stroke="black" strokeWidth="2" />
                </svg>
                <br />N (வ)
              </div>
            </div>
            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', width: '100%', color: '#000000' }}>
              அளவுக்கு வரையப்பட்டதல்ல,
            </div>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {activeModal.isOpen && (
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
              {activeModal.title}
            </div>
            <canvas
              ref={modalCanvasRef}
              width={440}
              height={250}
              onMouseDown={startModalDrawing}
              onMouseMove={drawModal}
              onMouseUp={stopModalDrawing}
              onTouchStart={startModalDrawing}
              onTouchMove={drawModal}
              onTouchEnd={stopModalDrawing}
              style={{ border: '2px solid #cbd5e0', backgroundColor: '#ffffff', cursor: 'crosshair', borderRadius: '6px', touchAction: 'none' }}
            />
            <div style={{ display: 'flex', width: '100%', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={clearModalCanvas}
                style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f56565', color: 'white' }}
              >
                அழி (Clear)
              </button>
              <button
                onClick={closeSignatureModal}
                style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#718096', color: 'white' }}
              >
                மூடு (Close)
              </button>
              <button
                onClick={saveSignature}
                style={{ flex: 1, padding: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#48bb78', color: 'white' }}
              >
                சரி (Save)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Control Box (Drawing Tools) */}
      {applicantStatus === 'satisfied' && (
        <div
          className="no-print"
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            boxSizing: 'border-box',
            marginBottom: '15px',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d3748' }}>வரைபடக் கட்டுப்பாடுகள் (FMB Tools)</h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fffaf0',
              border: '1px dashed #ed8936',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#c05621',
            }}
          >
            <input
              type="checkbox"
              id="toggleDotsVisibility"
              checked={showDots}
              onChange={(e) => setShowDots(e.target.checked)}
              style={{ width: '20px', height: '20px', marginRight: '10px', cursor: 'pointer' }}
            />
            <label htmlFor="toggleDotsVisibility" style={{ cursor: 'pointer', color: '#c05621' }}>
              வரைபடத்தில் புள்ளிகளைக் காட்டு (Show Joint Dots)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568', fontSize: '13px' }}>
                FMB-ன் அதிகபட்ச நீளம் (மீ):
              </label>
              <input
                type="number"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568', fontSize: '13px' }}>
                செயல்பாடு (Action Mode):
              </label>
              <select
                value={drawingMode}
                onChange={handleModeChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="outer">1. Outer boundary by circle method</option>
                <option value="inner_point">2. Subdivision points by circle method</option>
                <option value="inner_line">3. Subdivision line</option>
                <option value="frill_draw">4. Adjacent boundary line</option>
                <option value="adj_text">5. Adjacent survey number</option>
                <option value="edit_meas">6. Modify measurement text</option>
              </select>
            </div>
          </div>

          {drawingMode === 'outer' && (
            <button
              onClick={closeOuterBoundary}
              style={{ width: '100%', padding: '10px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
            >
              வெளிப்புற எல்லையை முடி (Close Outer)
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={undoLastAction}
              style={{ flex: 1, padding: '10px', backgroundColor: '#f56565', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ஒரு படி பின்னே (Undo)
            </button>
            <button
              onClick={resetCanvas}
              style={{ flex: 1, padding: '10px', backgroundColor: '#718096', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              அனைத்தையும் அழி (Reset)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}