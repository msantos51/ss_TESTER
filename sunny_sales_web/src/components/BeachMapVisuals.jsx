import React, { useEffect, useRef } from 'react';
import './BeachMapVisuals.css';

export default function BeachMapVisuals() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Cores dos elementos da praia
    const colors = {
      sky: '#87CEEB',
      water: '#0066CC',
      waterShallow: '#4DB8E8',
      foam: '#FFFFFF',
      sand: '#F4D03F',
      sandDark: '#E8C547',
      rock: '#8B7355',
      seaweed: '#228B22',
      sunlight: 'rgba(255, 255, 200, 0.3)',
    };

    // Limpa o canvas
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, width, height);

    // Sol
    const sunX = width * 0.8;
    const sunY = height * 0.2;
    const sunRadius = 50;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Raios do sol
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const startX = sunX + Math.cos(angle) * (sunRadius + 20);
      const startY = sunY + Math.sin(angle) * (sunRadius + 20);
      const endX = sunX + Math.cos(angle) * (sunRadius + 60);
      const endY = sunY + Math.sin(angle) * (sunRadius + 60);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Gradiente de água (fundo para frente)
    const waterGradient = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.65);
    waterGradient.addColorStop(0, colors.water);
    waterGradient.addColorStop(0.7, colors.waterShallow);
    waterGradient.addColorStop(1, colors.sandDark);

    // Água
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, height * 0.25, width, height * 0.4);

    // Ondas (padrão de movimento)
    ctx.strokeStyle = colors.foam;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    for (let wave = 0; wave < 4; wave++) {
      const waveY = height * (0.3 + wave * 0.08);
      ctx.beginPath();
      for (let x = 0; x <= width; x += 20) {
        const y = waveY + Math.sin((x + wave * 30) / 30) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Areia
    ctx.fillStyle = colors.sand;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // Gradiente de areia (mais escura em baixo)
    const sandGradient = ctx.createLinearGradient(0, height * 0.65, 0, height);
    sandGradient.addColorStop(0, colors.sand);
    sandGradient.addColorStop(1, colors.sandDark);
    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);

    // Padrão de areia (pontos pequenos)
    ctx.fillStyle = 'rgba(200, 140, 0, 0.2)';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = height * 0.65 + Math.random() * (height * 0.35);
      const radius = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Espuma/Mar na fronteira
    ctx.fillStyle = colors.foam;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 15) {
      const y = height * 0.62 + Math.sin(x / 40) * 15;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height * 0.62);
    ctx.lineTo(0, height * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Algas/Vegetação no lado esquerdo
    ctx.fillStyle = colors.seaweed;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 5; i++) {
      const startX = width * 0.1 + i * width * 0.15;
      const startY = height * 0.6 + Math.random() * 20;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let step = 0; step < 5; step++) {
        const offsetX = Math.sin(step / 3) * 20;
        const offsetY = 30 + step * 15;
        ctx.lineTo(startX + offsetX, startY + offsetY);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.seaweed;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Rochas/Pedras na areia
    const rocks = [
      { x: width * 0.2, y: height * 0.75, r: 25 },
      { x: width * 0.5, y: height * 0.8, r: 30 },
      { x: width * 0.8, y: height * 0.72, r: 20 },
      { x: width * 0.35, y: height * 0.85, r: 18 },
    ];

    rocks.forEach(rock => {
      ctx.fillStyle = colors.rock;
      ctx.beginPath();
      ctx.ellipse(rock.x, rock.y, rock.r, rock.r * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Sombra nas rochas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(rock.x + 5, rock.y + 8, rock.r * 0.6, rock.r * 0.3, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Guarda-sol (representado por triângulo)
    const umbrellaX = width * 0.7;
    const umbrellaY = height * 0.7;
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(umbrellaX, umbrellaY - 40);
    ctx.lineTo(umbrellaX - 35, umbrellaY + 20);
    ctx.lineTo(umbrellaX + 35, umbrellaY + 20);
    ctx.closePath();
    ctx.fill();

    // Haste do guarda-sol
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(umbrellaX, umbrellaY + 20);
    ctx.lineTo(umbrellaX, umbrellaY + 60);
    ctx.stroke();

  }, []);

  return (
    <div className="beach-map-visuals">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="beach-canvas"
      />
    </div>
  );
}
