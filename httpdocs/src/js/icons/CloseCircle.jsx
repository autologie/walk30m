import React from 'react';

export default function() {
  return (
    <svg height="100%" width="100%" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" style={{fill: "rgb(100,100,100)", stroke:"rgb(255,255,255)", strokeWidth: 8}} />
      <path d="M 20 20 L 44 44" style={{fill: "transparent", stroke:"rgb(255,255,255)", strokeWidth: 8}} />
      <path d="M 20 44 L 44 20" style={{fill: "transparent", stroke:"rgb(255,255,255)", strokeWidth: 8}} />
    </svg>
  );
}
