const React = require('react')
const styled = require('styled-components').default

const { pluckChildProps } = require('../../utils')

const TextArea = styled.div `
  > ._label {
    display: inline-block;
    margin-left: 10px;
    transform: translateY(14px);
    padding: 0 10px;
    width: fit-content;
    font-size: 14px;
    font-style: normal;
    font-stretch: normal;
    color: #afbed1;
    background-color: white;
  }

  > ._input {
    width: 100%;
    height: 100%;
    display: block;
    padding: 10px;
    resize: none;
    border: solid 1px rgba(120, 151, 188, 0.3);
  }
`

module.exports = (props) => {
  const childProps = pluckChildProps(props.children, [
    'container',
    'label',
    'input',
  ])

  return (
    <TextArea {...props}>
      <div className="_label" {...childProps.label}>{childProps.label.children}</div>
      <textarea className="_input" {...childProps.input}>{childProps.input.children}</textarea>
    </TextArea>
  )
}
