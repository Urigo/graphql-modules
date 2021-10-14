import { FC } from 'react';

const List: FC<{ className?: string }> & {
  Item: FC<{ className?: string }>;
  GreedyItem: FC<{ className?: string }>;
} = (props) => <ul {...props} className={`List ${props.className || ''}`} />;

List.Item = function ListItem(props) {
  return <li {...props} className={`ListItem ${props.className || ''}`} />;
};
List.GreedyItem = function ListGreedyItem(props) {
  return (
    <button {...props} className={`ListGreedyItem ${props.className || ''}`} />
  );
};

export default List;
