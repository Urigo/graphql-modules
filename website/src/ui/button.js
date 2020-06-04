import React from 'react';

export function Button(props) {
  return <button {...props} className={`Button ${props.className || ''}`} />;
}
