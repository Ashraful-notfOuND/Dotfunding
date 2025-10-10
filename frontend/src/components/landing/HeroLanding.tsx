import React, { useEffect, useRef } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TypewriterText from '@/components/TypewriterText';

const HeroLanding: React.FC = () => {
    const rootRef = useRef<HTMLElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const descRef = useRef<HTMLParagraphElement | null>(null);
    const ctaRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Import gsap dynamically to avoid SSR issues and keep bundle small for pages that don't use it
        let ctx: any;

        const setup = async () => {
            const mod = await import('gsap');
            const gsapLib: any = (mod as any).gsap || (mod as any).default || mod;
            const stMod = await import('gsap/ScrollTrigger');
            const ScrollTrigger: any = (stMod as any).ScrollTrigger || (stMod as any).default || stMod;

            // Register ScrollTrigger (use any-typed vars to satisfy TS)
            if (gsapLib && ScrollTrigger) {
                gsapLib.registerPlugin && gsapLib.registerPlugin(ScrollTrigger);
            }

            // Respect prefers-reduced-motion
            const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) return;

            ctx = gsapLib.context(() => {
                const lines = titleRef.current ? Array.from(titleRef.current.querySelectorAll('span')) : [];

                const tl = gsapLib.timeline({ defaults: { ease: 'power3.out' } });

                tl.from(lines, {
                    y: 28,
                    opacity: 0,
                    stagger: 0.12,
                    duration: 0.7,
                })
                    .from(descRef.current, { y: 18, opacity: 0, duration: 0.6 }, '-=0.45')
                    .from(ctaRef.current?.children || [], { y: 10, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.35');

                // Attach ScrollTrigger to the timeline so it plays when header enters viewport
                (ScrollTrigger as any).create({
                    trigger: rootRef.current,
                    start: 'top 80%',
                    end: 'bottom top',
                    animation: tl,
                    toggleActions: 'play none none reverse',
                });
            }, rootRef);
        };

        setup();

        return () => {
            if (ctx && ctx.revert) ctx.revert();
        };
    }, []);

    return (
        // keep relative positioning for layering, mount particles inside header
        // taller header and vertically center its content
        <motion.header ref={rootRef} className="relative text-gray-900 overflow-hidden flex items-center min-h-[72vh]" aria-label="Hero">
            <ParticleBackground count={180} />
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <h1 ref={titleRef} className="text-4xl md:text-6xl font-extrabold leading-tight">
                        <span className="block">Launch ideas</span>
                        <span className="block">Build Communities</span>
                        <span className="block"> <TypewriterText texts={["Change the world", "Find backers", "Get Funded"]} infinite className="text-accent" /> </span>
                    </h1>

                    <p ref={descRef} className="mt-4 text-lg text-black-200">Create, fund, and share creative projects with an audience that cares. Fast setup, flexible rewards, and transparent funding.</p>

                    <div ref={ctaRef} className="mt-8 flex justify-center gap-4">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link to="/create-project" className="inline-block bg-accent text-white font-semibold px-8 py-4 rounded-lg shadow text-lg transition">Start a Project</Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Link to="/explore" className="inline-block border border-white/30 px-5 py-3 rounded-lg hover:bg-white/5 transition">Explore Projects</Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.header>
    );
};

export default HeroLanding;
