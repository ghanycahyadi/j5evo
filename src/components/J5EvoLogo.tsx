import React, { useState } from "react";

interface J5EvoLogoProps {
  className?: string;
  color?: string; // Hex color, defaults to #005c56
  bgFill?: string; // Behind elements inside shield, defaults to #ffffff
}

export default function J5EvoLogo({ className = "w-12 h-12", color = "#005c56", bgFill = "#ffffff" }: J5EvoLogoProps) {
  const [useFallback, setUseFallback] = useState(false);

  // If fallback is false, try to load the uploaded PNG logo first
  if (!useFallback) {
    return (
      <img
        src="/logo.png"
        alt="J5 Evo Logo"
        className={`${className} object-contain transition-all duration-300`}
        onError={() => setUseFallback(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} select-none transition-all duration-300`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Outer Shield Shape with strong border */}
      <path
        d="M 10,4.5 L 90,4.5 L 90,62 C 90,78 50,96 50,96 C 50,96 10,78 10,62 Z"
        fill={bgFill}
        stroke={color}
        strokeWidth="7"
        strokeLinejoin="miter"
      />

      {/* 3. Stencil "JAECOO" Logo on the Top-Left of Inner Space */}
      {/* Letter structures drawn beautifully as clean path lines */}
      <g fill={color}>
        {/* J */}
        <path d="M 16.5,12.5 H 18.5 V 15 C 18.5,15.6 18.1,16 17.5,16 C 16.9,16 16.5,15.6 16.5,15 Z" />
        {/* A */}
        <path d="M 19.5,16 V 12.5 H 21.5 V 16 H 20.8 V 14.6 H 20.2 V 16 Z M 20.2,14 H 20.8 V 13.1 H 20.2 Z" />
        {/* E */}
        <path d="M 22.5,12.5 H 24.5 V 13.2 H 23.2 V 13.8 H 24.2 V 14.5 H 23.2 V 15.3 H 24.5 V 16 H 22.5 Z" />
        {/* C */}
        <path d="M 25.5,12.5 H 27.5 V 13.2 H 26.2 V 15.3 H 27.5 V 16 H 25.5 Z" />
        {/* O */}
        <path d="M 28.5,12.5 H 30.5 V 16 H 28.5 Z M 29.2,13.2 V 15.3 H 29.8 V 13.2 Z" />
        {/* O */}
        <path d="M 31.5,12.5 H 33.5 V 16 H 31.5 Z M 32.2,13.2 V 15.3 H 32.8 V 13.2 Z" />
      </g>

      {/* 4. Large stylized "J5" Group */}
      <g fill={color}>
        {/* Highly stylized upper serif of J extending all the way under JAECOO */}
        <path d="M 16.1,23.5 H 39.8 V 28.2 H 16.1 Z" />
        {/* Right-sided vertical stem of the J */}
        <path d="M 39.8,10.2 H 44.8 V 28.2 H 39.8 Z" />
        
        {/* Stylized '5' */}
        {/* Top bar of 5 */}
        <path d="M 49.8,10.2 H 83.8 V 14.8 H 49.8 Z" />
        {/* Left vertical link of 5 */}
        <path d="M 49.8,14.8 H 54.8 V 21.6 H 49.8 Z" />
        {/* Big upper loop slice of 5 */}
        <path d="M 49.8,21.6 H 83.8 V 28.2 H 49.8 Z" />
        {/* Right side tail of 5 */}
        <path d="M 78.8,14.8 H 83.8 V 21.6 H 78.8 Z" />
      </g>

      {/* 5. Middle Row "EVO" Text */}
      <g fill={color}>
        {/* Letter E */}
        {/* Top bar */}
        <path d="M 16.1,31.2 H 37.1 V 34.6 H 16.1 Z" />
        {/* Mid bar */}
        <path d="M 19.3,36.0 H 37.1 V 39.4 H 19.3 Z" />
        {/* Bottom bar */}
        <path d="M 16.1,40.8 H 37.1 V 44.2 H 16.1 Z" />
        {/* Left bar */}
        <path d="M 16.1,31.2 H 19.5 V 44.2 H 16.1 Z" />

        {/* Letter V */}
        {/* Left angled leg */}
        <path d="M 39.8,31.2 L 48.2,44.2 H 52.8 L 44.4,31.2 Z" />
        {/* Right angled leg */}
        <path d="M 60.1,31.2 L 51.7,44.2 H 47.1 L 55.5,31.2 Z" />

        {/* Letter O (Stylized Hollow Capsule) */}
        <path d="M 62.9,31.2 H 83.9 V 44.2 H 62.9 Z M 68.4,34.6 V 40.8 H 78.4 V 34.6 Z" />
      </g>

      {/* 6. Realistic detailed vector silhouette of Jaecoo J5 SUV Front Bumper & Grill */}
      <g fill={color}>
        {/* Windshield Pillar Frame left-to-right roofline arc */}
        <path d="M 23.5,50.1 C 24.5,47.8 28.2,45.8 33.2,45.5 L 66.8,45.5 C 71.8,45.8 75.5,47.8 76.5,50.1 L 79.5,55.5 C 80.5,57.1 79.8,58.2 78.2,58.2 L 21.8,58.2 C 20.2,58.2 19.5,57.1 20.5,55.5 Z" />
        
        {/* Inner Windshield glass cut-out */}
        <path d="M 25.1,51.0 L 27.5,47.1 L 72.5,47.1 L 74.9,51.0 Z" fill={bgFill} />
        
        {/* Side Wing Mirrors */}
        {/* Left mirror */}
        <path d="M 14.8,56.5 C 14.8,54.8 17.0,55.1 22.0,55.2 L 23.1,58.7 C 18.2,58.7 14.8,58.2 14.8,56.5 Z" />
        {/* Right mirror */}
        <path d="M 85.2,56.5 C 85.2,54.8 83.0,55.1 78.0,55.2 L 76.9,58.7 C 81.8,58.7 85.2,58.2 85.2,56.5 Z" />

        {/* Dynamic Hood to Grill Solid Base Body Block */}
        <path d="M 15.1,59.5 C 15.1,59.5 16.5,84.1 33.5,88.2 L 50.0,91.8 L 66.5,88.2 C 83.5,84.1 84.9,59.5 84.9,59.5 Z" />
        
        {/* Clean detailed White Lines to form active grill bar details */}
        {/* Front-left wheel well cut and shadow */}
        <path d="M 23.8,70.5 C 23.8,70.5 32.5,79.5 33.2,88.0 L 29.5,88.0 C 27.2,84.0 23.8,78.5 23.8,70.5 Z" fill={bgFill} />

        {/* Distinctive Horizontal Headlight Bar & Grill Bar */}
        <rect x="32.5" y="63.8" width="50.0" height="3.5" fill={bgFill} rx="0.5" />
        
        {/* Ultra small JAECOO text inside headlight block */}
        <text
          x="57.5"
          y="66.3"
          fontSize="2.1"
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
          fontFamily="sans-serif"
          letterSpacing="0.05"
        >
          JAECOO
        </text>

        {/* White bottom-center mesh spoiler block bar */}
        <rect x="37.5" y="76.2" width="25.0" height="5.5" fill={bgFill} rx="0.5" />
        <rect x="47.5" y="76.2" width="15.0" height="5.5" fill={color} rx="0.3" />
      </g>
    </svg>
  );
}
