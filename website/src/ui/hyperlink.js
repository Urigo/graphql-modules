import React from 'react';
import Link from '@docusaurus/Link';

export function Hyperlink(props) {
  return <Link {...props} className={`Hyperlink ${props.className || ''}`} />;
}
