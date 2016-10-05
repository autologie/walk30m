import React from 'react';

export default function(props) {
  const expand = props.mode === 'expand';

  return (
    <svg height="100%" width="100%" viewBox="0 0 64 64">
      <path d="M 8 8 L 32 24 L 56 8" style={{display: expand ? 'none' : 'inline', fill: "transparent", stroke:"rgb(100,100,100)", strokeWidth: 6}} />
      <path d="M 8 56 L 32 40 L 56 56" style={{display: expand ? 'none' : 'inline', fill: "transparent", stroke:"rgb(100,100,100)", strokeWidth: 6}} />
      <path d="M 8 24 L 32 8 L 56 24" style={{display: expand ? 'inline' : 'none', fill: "transparent", stroke:"rgb(100,100,100)", strokeWidth: 6}} />
      <path d="M 8 40 L 32 56 L 56 40" style={{display: expand ? 'inline' : 'none', fill: "transparent", stroke:"rgb(100,100,100)", strokeWidth: 6}} />
    </svg>
  );
}
