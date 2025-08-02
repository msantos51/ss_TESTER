import React, { useRef, useState } from 'react';
import './ImageCropper.css';

// Componente simples para cortar imagem quadrada
export default function ImageCropper({ src, onCancel, onComplete }) {
  const imgRef = useRef(null);
  const containerSize = 300; // tamanho da área de corte
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const endDrag = () => {
    setDragging(false);
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = containerSize;
    canvas.height = containerSize;
    const ctx = canvas.getContext('2d');
    const displayWidth = naturalWidth * scale;
    const displayHeight = naturalHeight * scale;
    const sx = -position.x * (naturalWidth / displayWidth);
    const sy = -position.y * (naturalHeight / displayHeight);
    const sWidth = containerSize * (naturalWidth / displayWidth);
    const sHeight = containerSize * (naturalHeight / displayHeight);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, containerSize, containerSize);
    canvas.toBlob((blob) => {
      if (blob) onComplete(blob);
    }, 'image/jpeg');
  };

  return (
    <div className="cropper-overlay" onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}>
      <div className="cropper-box">
        <div
          className="cropper-area"
          style={{ width: containerSize, height: containerSize }}
          onMouseDown={startDrag}
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          />
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        />
        <div className="cropper-actions">
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button type="button" onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
