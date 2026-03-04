'use client';

import React, { useRef } from 'react';
import { animate } from 'animejs';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  animationType?: 'pop' | 'lift' | 'tilt';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  animationType = 'pop', 
  className,
  onClick,
  ...props 
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    
    if (animationType === 'lift') {
      animate(btnRef.current, {
        translateY: -3,
        scale: 1.02,
        duration: 300,
        easing: 'outQuad'
      });
    } else if (animationType === 'pop') {
      animate(btnRef.current, {
        scale: 1.05,
        duration: 200,
        easing: 'outQuad'
      });
    }
    
    if (props.onMouseEnter) props.onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    
    animate(btnRef.current, {
      translateY: 0,
      scale: 1,
      duration: 300,
      easing: 'outQuad'
    });
    
    if (props.onMouseLeave) props.onMouseLeave(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    
    // Click "juice" effect
    animate(btnRef.current, {
      scale: [1, 0.95, 1],
      duration: 200,
      easing: 'inOutQuad'
    });

    if (onClick) onClick(e);
  };

  return (
    <button
      ref={btnRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
