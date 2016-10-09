import React from 'react';

export default function(props) {
  const expand = props.mode === 'expand';

  return (
    <svg height="100%" width="100%" viewBox="0 0 64 64">
      <path d="M 8 24 L 32 40 L 56 24" style={{fill: "transparent", stroke:"rgb(100,100,100)", strokeWidth: 6}} />
    </svg>
  );
}
