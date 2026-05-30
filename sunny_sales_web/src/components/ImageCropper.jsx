import React, { useRef, useState } from 'react';
import './ImageCropper.css';

// Componente simples para cortar imagem quadrada
export default function ImageCropper({ src, onCancel, onComplete }) {
  const imgRef = useRef(null);
  const containerSize = 300; // tamanho da área de corte
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(0.1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleImageLoad = (e) => {
    const img = e.target;
    const computed = Math.max(containerSize / img.naturalWidth, containerSize / img.naturalHeight);
    setMinScale(computed);
    setScale(computed);
    setPosition({
      x: (containerSize - img.naturalWidth * computed) / 2,
      y: (containerSize - img.naturalHeight * computed) / 2,
    });
  };
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    const coords = getCoords(e);
    lastPos.current = coords;
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const coords = getCoords(e);
    const dx = coords.x - lastPos.current.x;
    const dy = coords.y - lastPos.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = coords;
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
    <div
      className="cropper-overlay"
      onMouseMove={onDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchMove={onDrag}
      onTouchEnd={endDrag}
    >
      <div className="cropper-box">
        <div
          className="cropper-area"
          style={{ width: containerSize, height: containerSize }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            onLoad={handleImageLoad}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: '0 0',
            }}
          />
        </div>
        <input
          type="range"
          min={minScale}
          max={Math.max(3, minScale * 10)}
          step={minScale / 10}
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
