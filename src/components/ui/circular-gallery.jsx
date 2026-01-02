import React, { useState, useEffect, useRef, forwardRef } from 'react';

// A simple utility for conditional class names
const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
}

const CircularGallery = forwardRef(
    ({ items, className, radius = 600, autoRotateSpeed = 0.02, ...props }, ref) => {
        const [rotation, setRotation] = useState(0);
        const [isScrolling, setIsScrolling] = useState(false);
        const scrollTimeoutRef = useRef(null);
        const animationFrameRef = useRef(null);

        // Effect to handle scroll-based rotation
        useEffect(() => {
            const handleScroll = () => {
                setIsScrolling(true);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }

                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
                const scrollRotation = scrollProgress * 360;
                setRotation(scrollRotation);

                scrollTimeoutRef.current = setTimeout(() => {
                    setIsScrolling(false);
                }, 150);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                window.removeEventListener('scroll', handleScroll);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
            };
        }, []);

        // Effect for auto-rotation when not scrolling
        useEffect(() => {
            const autoRotate = () => {
                if (!isScrolling) {
                    setRotation(prev => prev + autoRotateSpeed);
                }
                animationFrameRef.current = requestAnimationFrame(autoRotate);
            };

            animationFrameRef.current = requestAnimationFrame(autoRotate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isScrolling, autoRotateSpeed]);

        const anglePerItem = 360 / items.length;

        return (
            <div
                ref={ref}
                role="region"
                aria-label="Circular 3D Gallery"
                className={cn("relative w-full h-full flex items-center justify-center", className)}
                style={{ perspective: '2000px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                {...props}
            >
                <div
                    style={{
                        transform: `rotateY(${rotation}deg)`,
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {items.map((item, i) => {
                        const itemAngle = i * anglePerItem;
                        const totalRotation = rotation % 360;
                        const relativeAngle = (itemAngle + totalRotation + 360) % 360;
                        const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
                        const opacity = Math.max(0.3, 1 - (normalizedAngle / 180));

                        return (
                            <div
                                key={item.photo.url}
                                role="group"
                                aria-label={item.common}
                                style={{
                                    position: 'absolute',
                                    width: '280px',
                                    height: '380px',
                                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-140px',
                                    marginTop: '-190px',
                                    opacity: opacity,
                                    transition: 'opacity 0.3s linear'
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '16px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(37, 99, 235, 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}>
                                    <img
                                        src={item.photo.url}
                                        alt={item.photo.text}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: item.photo.pos || 'center',
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        padding: '1.5rem 1rem',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                        color: 'white',
                                    }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{item.common}</h2>
                                        <em style={{ fontSize: '0.875rem', fontStyle: 'italic', opacity: 0.9 }}>{item.binomial}</em>
                                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>Photo by: {item.photo.by}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
export default CircularGallery;
