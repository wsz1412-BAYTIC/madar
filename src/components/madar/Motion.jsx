import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from 'framer-motion';

// Shared physics: one spring for entrances (soft, no overshoot) so every page
// moves with the same character instead of per-component magic numbers.
const ENTER_SPRING = { type: 'spring', stiffness: 130, damping: 24, mass: 0.9 };
const EASE_OUT = /** @type {[number, number, number, number]} */ ([0.22, 1, 0.36, 1]);

export function FadeIn({ children, delay = 0, y = 24, className = '', once = true }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ ...ENTER_SPRING, delay, opacity: { duration: 0.55, delay, ease: EASE_OUT } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className = '', once = true }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ ...ENTER_SPRING, delay, opacity: { duration: 0.5, delay, ease: EASE_OUT } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ children, delay = 0, x = -40, className = '', once = true }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, x: reduce ? 0 : x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ ...ENTER_SPRING, delay, opacity: { duration: 0.55, delay, ease: EASE_OUT } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, stagger = 0.1, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', y = 24 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { ...ENTER_SPRING, opacity: { duration: 0.5, ease: EASE_OUT } },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Subtle hover lift for interactive cards — spring up 4px with a settle, press
// compresses. Use around glass/stat cards for tactile feedback.
export function HoverLift({ children, className = '', lift = -4 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: lift }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxImage({ src, alt, className = '', speed = 0.3 }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y: smoothY }}
        className="absolute inset-0 w-full h-[120%] object-cover"
      />
    </div>
  );
}

// Genuinely magnetic: the button leans toward the pointer while hovered and
// springs home on leave. Falls back to plain scale on touch/reduced-motion.
export function MagneticButton({ children, className = '', onClick, type = 'button', disabled }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.5 });
  const ySpring = useSpring(my, { stiffness: 260, damping: 18, mass: 0.5 });

  const handleMove = (e) => {
    if (reduce || !ref.current || e.pointerType === 'touch') return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.18);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.28);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={/** @type {'button' | 'submit' | 'reset'} */ (type)}
      onClick={onClick}
      disabled={disabled}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={reduce ? undefined : { x, y: ySpring }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedCounter({ value, duration = 2, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  const str = String(value ?? '');
  const numeric = parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = str.replace(/[0-9,]/g, '');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, numeric, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, numeric, duration]);

  return (
    <span ref={ref} className={`nums ${className}`}>
      {display.toLocaleString()}{suffix}
    </span>
  );
}

export default { FadeIn, ScaleIn, SlideIn, StaggerContainer, StaggerItem, HoverLift, ParallaxImage, MagneticButton, AnimatedCounter };
