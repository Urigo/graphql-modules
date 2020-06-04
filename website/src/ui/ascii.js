import React from 'react';

export const Ascii = {
  Close: (props) => (
    <span {...props} role="img" aria-label="close">
      ❌
    </span>
  ),
  Hamburger: (props) => (
    <span {...props} role="img" aria-label="hamburger">
      ☰
    </span>
  ),
};
