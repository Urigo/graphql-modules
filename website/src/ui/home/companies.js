import React from 'react';
import { List } from '../list';

const airfranceLogo = `/img/home/companies/airfrance-logo.svg`;
const klmLogo = `/img/home/companies/klm-logo.svg`;
const msjLogo = `/img/home/companies/msj-logo.svg`;
const schneiderLogo = `/img/home/companies/schneider-logo.svg`;

export function Companies(props) {
  return (
    <div {...props} className={`Companies ${props.className || ''}`}>
      <List className="_companies-list">
        <List.GreedyItem className="_company">
          <img src={airfranceLogo} alt="airfrance" />
        </List.GreedyItem>
        <List.GreedyItem className="_company">
          <img src={klmLogo} alt="klm" />
        </List.GreedyItem>
        <List.GreedyItem className="_company">
          <img src={msjLogo} alt="msj" />
        </List.GreedyItem>
        <List.GreedyItem className="_company">
          <img src={schneiderLogo} alt="schneider" />
        </List.GreedyItem>
      </List>
    </div>
  );
}
