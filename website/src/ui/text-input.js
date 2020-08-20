import React from 'react';
import { pluckChildProps } from '../../utils';

export function TextInput(props) {
  const childProps = pluckChildProps(props.children, [
    'container',
    'label',
    'input',
  ]);

  return (
    <div {...props} className={`TextInput ${props.className || ''}`}>
      <div className="_label" {...childProps.label}>
        {childProps.label.children}
      </div>
      <input type="text" className="_input" {...childProps.input}>
        {childProps.input.children}
      </input>
    </div>
  );
}
