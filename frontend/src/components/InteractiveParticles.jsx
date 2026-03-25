// src/components/InteractiveParticles.jsx
import { useEffect, useRef } from 'react';

export default function InteractiveParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    const mouse = { x: null, y: null, radius: 170 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    class Particle {
      constructor() {
        this.baseX = Math.random() * canvas.width;
        this.baseY = Math.random() * canvas.height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.size = Math.random() * 2.5 + 2;
        this.density = (Math.random() * 35) + 5;
        
        // 70% Rings, 30% Solid Blue
        this.isBlue = Math.random() > 0.7;
        // Use a Slate Gray for the rings to stand out against Off-White
        this.ringColor = 'rgba(148, 163, 184, 0.5)'; 
        this.blueColor = '#3b82f6'; 
      }

      draw() {
        ctx.beginPath();
        if (this.isBlue) {
          // SOLID BLUE SPHERE
          ctx.fillStyle = this.blueColor;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // HOLLOW SLATE GRAY RING (Replaces invisible white)
          ctx.strokeStyle = this.ringColor;
          ctx.lineWidth = 1.2;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.closePath();
      }

      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * this.density;
          this.y -= (dy / distance) * force * this.density;
        } else {
          if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
          if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 150; i++) particles.push(new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.draw(); p.update(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    init(); animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}