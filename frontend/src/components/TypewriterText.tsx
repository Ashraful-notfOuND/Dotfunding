import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  className?: string;
  infinite?: boolean;
  pauseDuration?: number;
}

const TypewriterText = ({ 
  texts,
  speed = 50, 
  className = '',
  infinite = false,
  pauseDuration = 2000
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [maxTextWidth, setMaxTextWidth] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      const widths = texts.map(text => {
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.fontSize = window.getComputedStyle(spanRef.current).fontSize;
        tempSpan.style.fontWeight = window.getComputedStyle(spanRef.current).fontWeight;
        tempSpan.style.fontFamily = window.getComputedStyle(spanRef.current).fontFamily;
        tempSpan.innerText = text;
        document.body.appendChild(tempSpan);
        const width = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        return width;
      });
      setMaxTextWidth(Math.max(...widths));
    }
  }, [texts]);

  useEffect(() => {
    const animatedText = texts[textIndex];

    if (!infinite) {
      if (currentIndex < animatedText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(animatedText.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, speed);
        return () => clearTimeout(timeout);
      }
    } else {
      // Infinite loop logic
      if (!isDeleting && currentIndex < animatedText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(animatedText.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else if (!isDeleting && currentIndex === animatedText.length) {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
        return () => clearTimeout(timeout);
      } else if (isDeleting && currentIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(animatedText.slice(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        }, speed / 2);
        return () => clearTimeout(timeout);
      } else if (isDeleting && currentIndex === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [currentIndex, textIndex, texts, speed, infinite, isDeleting, pauseDuration]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className} ref={spanRef} style={{minWidth: maxTextWidth, display: 'inline-block'}}>
      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {displayedText}
      </span>
      {showCursor && (
        <span className="inline-block w-1 h-12 bg-primary ml-1 animate-pulse" />
      )}
    </span>
  );
};

export default TypewriterText;
