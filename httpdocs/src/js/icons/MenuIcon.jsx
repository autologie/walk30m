import React from 'react';

export default function(props) {
  const hide = props.mode === 'hide';

  return (
    <svg height="100%" width="100%" viewBox="0 0 64 64">
      <line x1="10" y1="16" x2="54" y2="16" style={{display: hide ? 'none' : 'inline', stroke:"rgb(255,255,255)", strokeWidth: 4}} />
      <line x1="10" y1="32" x2="54" y2="32" style={{display: hide ? 'none' : 'inline', stroke:"rgb(255,255,255)", strokeWidth: 4}} />
      <line x1="10" y1="48" x2="54" y2="48" style={{display: hide ? 'none' : 'inline', stroke:"rgb(255,255,255)", strokeWidth: 4}} />
      <line x1="16" y1="16" x2="50" y2="48" style={{display: hide ? 'inline' : 'none', stroke:"rgb(255,255,255)", strokeWidth: 4}} />
      <line x1="16" y1="48" x2="50" y2="16" style={{display: hide ? 'inline' : 'none', stroke:"rgb(255,255,255)", strokeWidth: 4}} />
    </svg>
  );
}
