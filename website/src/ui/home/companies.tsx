import { FC } from 'react';
import Image from 'next/image';
import List from '../list';

const Companies: FC = () => {
  return (
    <div className="Companies">
      <List className="_companies-list">
        {[
          {
            src: '/assets/img/home/companies/airfrance-logo.svg',
            alt: 'AirFrance',
          },
          {
            src: '/assets/img/home/companies/klm-logo.svg',
            alt: 'KLM',
          },
          {
            src: '/assets/img/home/companies/msj-logo.svg',
            alt: 'Mount St. Joseph University',
          },
          {
            src: '/assets/img/home/companies/schneider-logo.svg',
            alt: 'Schneider',
          },
        ].map(({ src, alt }) => (
          <Image
            key={alt}
            priority
            width={180}
            height={78}
            src={src}
            alt={alt}
          />
        ))}
      </List>
    </div>
  );
};

export default Companies;
