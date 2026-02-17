// src/App.tsx
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LabelData {
  id: number;
  manufDate: string;   // e.g. "2025-12-15"
  expDate: string;
  batchCode: string;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const LABEL_WIDTH_MM = 99;   // ≈ common 10-up size
const LABEL_HEIGHT_MM = 57;

const COLS = 2;
const ROWS = 5;
const LABELS_PER_PAGE = COLS * ROWS; // 10

function App() {
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [newManuf, setNewManuf] = useState('');
  const [newExp, setNewExp] = useState('');
  const [newBatch, setNewBatch] = useState('');

  const labelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const addLabel = () => {
    if (!newManuf || !newExp || !newBatch) return;

    const newLabel: LabelData = {
      id: Date.now(),
      manufDate: newManuf,
      expDate: newExp,
      batchCode: newBatch,
    };

    setLabels((prev) => [...prev, newLabel]);
    setNewManuf('');
    setNewExp('');
    setNewBatch('');
  };

  const generatePDFForLabel = async (label: LabelData) => {
    const element = labelRefs.current.get(label.id);
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 3,               // higher quality
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    // Calculate ratio to fit label size in PDF (mm)
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    const labelWidthPxInPDF = LABEL_WIDTH_MM;
    const labelHeightPxInPDF = LABEL_HEIGHT_MM;

    const scaleX = labelWidthPxInPDF / (imgWidthPx / canvas.width * pdf.internal.scaleFactor);
    const scale = Math.min(
      labelWidthPxInPDF / (imgWidthPx / 3.78), // rough px→mm
      labelHeightPxInPDF / (imgHeightPx / 3.78)
    );

    // We'll place 10 copies
    for (let i = 0; i < LABELS_PER_PAGE; i++) {
      if (i > 0) pdf.addPage();

      const col = i % COLS;
      const row = Math.floor(i / COLS);

      const marginLeft = 6;   // tune these margins / gaps
      const marginTop = 8;

      const x = marginLeft + col * (LABEL_WIDTH_MM + 3);   // 3mm gap
      const y = marginTop + row * (LABEL_HEIGHT_MM + 3);

      pdf.addImage(
        imgData,
        'PNG',
        x,
        y,
        LABEL_WIDTH_MM,
        LABEL_HEIGHT_MM,
        undefined,
        'FAST'
      );
    }

    pdf.save(`Label_${label.batchCode || label.id}.pdf`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Scotch Bonnet Label Generator</h1>

      {/* Form to add new label data */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <label>Mfg Date: </label><br />
          <input
            type="date"
            value={newManuf}
            onChange={(e) => setNewManuf(e.target.value)}
          />
        </div>

        <div>
          <label>Exp Date: </label><br />
          <input
            type="date"
            value={newExp}
            onChange={(e) => setNewExp(e.target.value)}
          />
        </div>

        <div>
          <label>Batch Code: </label><br />
          <input
            type="text"
            value={newBatch}
            onChange={(e) => setNewBatch(e.target.value)}
            placeholder="e.g. SB2025-001"
          />
        </div>

        <button
          onClick={addLabel}
          style={{
            marginTop: '24px',
            padding: '10px 20px',
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Add Label
        </button>
      </div>

      {/* List of created labels + preview + download */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {labels.map((label) => (
          <div
            key={label.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              background: '#f9f9f9',
            }}
          >
            <h3>Label #{label.id.toString().slice(-6)}</h3>
            <p><strong>Mfg:</strong> {label.manufDate || '—'}</p>
            <p><strong>Exp:</strong> {label.expDate || '—'}</p>
            <p><strong>Batch:</strong> {label.batchCode}</p>

            {/* Preview - this is what gets captured */}
            <div
              ref={(el) => {
                if (el) labelRefs.current.set(label.id, el);
              }}
              style={{
                width: `${LABEL_WIDTH_MM * 2}px`,   // ×2 for better preview
                height: `${LABEL_HEIGHT_MM * 2}px`,
                margin: '16px auto',
                border: '1px solid #aaa',
                borderRadius: '4px',
                overflow: 'hidden',
                background: 'white',
                position: 'relative',
                fontSize: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {/* Background flame/gradient simulation */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #ff5722, #f57c00, #ff9800)',
                opacity: 0.15,
              }} />

              <div style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Left green bar */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '22%',
                  background: '#2e7d32',
                }} />

                {/* Logo / text area */}
                <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>
                    MA'S DE COSTA
                  </div>
                  <div style={{ fontSize: '9px', color: '#e8f5e9' }}>
                    Ma's De Costa (PVT) LTD
                  </div>

                  <div style={{ marginTop: '8px', color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                    SCOTCH BONNET<br />POWDER
                  </div>

                  <div style={{ marginTop: '6px', fontSize: '9px', color: '#fff' }}>
                    Ingredients : Scotch Bonnet 100%
                  </div>

                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: '#fff', fontSize: '9px' }}>
                    MAS100003
                  </div>

                  {/* Right side info */}
                  <div style={{ position: 'absolute', right: '8px', top: '8px', textAlign: 'right', color: '#000' }}>
                    <div>Mfg.Date : {label.manufDate || '—'}</div>
                    <div>Exp.Date : {label.expDate || '—'}</div>
                    <div>Batch Code : {label.batchCode}</div>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    color: '#000',
                  }}>
                    Net Weight 1KG
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '8px',
                    color: '#333',
                  }}>
                    Store in a dry place. Keep under ambient conditions
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => generatePDFForLabel(label)}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Download PDF (10 labels / page)
            </button>
          </div>
        ))}
      </div>

      {labels.length === 0 && (
        <p style={{ textAlign: 'center', color: '#777', marginTop: '40px' }}>
          Add label data to create printable stickers.
        </p>
      )}
    </div>
  );
}

export default App;