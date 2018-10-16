const styled = require('styled-components').default

const List = styled.ul `
  list-style: none;
  margin: 0;
`

List.Item = styled.li `
`

List.GreedyItem = styled.button `
  background-color: transparent;
  border: none;
  outline: none;
`

module.exports = List
