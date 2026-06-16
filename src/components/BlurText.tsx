import { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";

type AnimateBy = "words" | "characters";
type Direction = "top" | "bottom";

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: AnimateBy;
  direction?: Direction;
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Variants => {
  const allKeys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, (string | number)[]> = {};
  allKeys.forEach((key) => {
    keyframes[key] = [
      from[key] ?? (typeof steps[0][key] === "number" ? 0 : "none"),
      ...steps.map((step) => step[key] ?? from[key]),
    ];
  });

  return { animate: keyframes };
};

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inViewCount, setInViewCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold, margin: rootMargin as unknown as `${number}px` });

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setInViewCount((prev) => {
        if (prev >= elements.length) {
          clearInterval(interval);
          onAnimationComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, delay);
    return () => clearInterval(interval);
  }, [inView, elements.length, delay, onAnimationComplete]);

  const defaultFrom: Record<string, string | number> =
    animationFrom ?? {
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "top" ? -20 : 20,
    };

  const defaultTo: Array<Record<string, string | number>> =
    animationTo ?? [
      { filter: "blur(5px)", opacity: 0.5, y: direction === "top" ? 5 : -5 },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ];

  const stepDurationValue = easing ? stepDuration : stepDuration;

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`} aria-label={text}>
      {elements.map((el, i) => {
        const variants = buildKeyframes(defaultFrom, defaultTo);
        const isVisible = i < inViewCount;

        return (
          <motion.span
            key={i}
            className="inline-block will-change-transform"
            initial={defaultFrom}
            animate={isVisible ? (variants.animate as Record<string, (string | number)[]>) : defaultFrom}
            transition={{
              duration: stepDurationValue * defaultTo.length,
              ease: easing ?? "easeOut",
              times: defaultTo.map((_, idx) => (idx + 1) / defaultTo.length),
            }}
            aria-hidden
          >
            {el === " " ? " " : el}
            {animateBy === "words" && i < elements.length - 1 ? " " : ""}
          </motion.span>
        );
      })}
    </p>
  );
}
