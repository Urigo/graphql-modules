const React = require('react')

const List = props => <ul {...props} className={`List ${props.className || ''}`} />
List.Item = props => <li {...props} className={`ListItem ${props.className || ''}`} />
List.GreedyItem = props => <button {...props} className={`ListGreedyItem ${props.className || ''}`} />

module.exports = List
