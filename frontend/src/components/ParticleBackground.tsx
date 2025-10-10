import React, { useEffect, useRef } from 'react';

type ParticleBackgroundProps = {
    className?: string;
    colorPalette?: string[];
    count?: number;
};

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ className = '', colorPalette = ['#60a5fa', '#7c3aed', '#06b6d4'], count = 120 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // use getBoundingClientRect for more accurate sizing inside positioned containers
        let rect = canvas.getBoundingClientRect();
        let width = rect.width || canvas.clientWidth;
        let height = rect.height || canvas.clientHeight;
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize);

        type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string; alpha: number };
        const particles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            // give each particle a baseline drift; increased magnitude for more visible motion
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6 + (Math.random() < 0.5 ? -0.15 : 0.15),
                vy: (Math.random() - 0.5) * 0.6 + (Math.random() < 0.5 ? -0.15 : 0.15),
                r: 1 + Math.random() * 3,
                c: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                alpha: 0.25 + Math.random() * 0.6,
            });
        }

        const mouse = { x: -9999, y: -9999 };
        const onMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        const onLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseleave', onLeave);

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // draw links
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(156,163,175,0.08)';
                        ctx.lineWidth = 1;
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // update and draw particles
            for (const p of particles) {
                // simple attraction/repulse from mouse
                const mx = mouse.x;
                const my = mouse.y;
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    p.vx += (dx / dist) * force * 0.3;
                    p.vy += (dy / dist) * force * 0.3;
                }

                // stronger per-frame jitter so particles maintain visible motion
                p.vx += (Math.sin((p.x + Date.now() * 0.0009)) * 0.003);
                p.vy += (Math.cos((p.y + Date.now() * 0.001)) * 0.003);

                p.x += p.vx;
                p.y += p.vy;

                // wrap edges
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                // friction balanced so particles drift but don't accelerate indefinitely
                p.vx *= 0.995;
                p.vy *= 0.995;

                ctx.beginPath();
                ctx.fillStyle = p.c;
                ctx.globalAlpha = p.alpha;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseleave', onLeave);
        };
    }, [count, colorPalette]);

    return (
        // absolute so it can be mounted inside a positioned ancestor (like the header)
        <div className={`absolute inset-0 -z-10 pointer-events-none ${className}`} aria-hidden>
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};

export default ParticleBackground;
