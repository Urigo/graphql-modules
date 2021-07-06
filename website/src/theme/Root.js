import React from 'react';
import { ThemeProvider, Header, FooterExtended } from '@theguild/components';

// Default implementation, that you can customize
function Root({ children }) {
  return (
    <ThemeProvider>
      <Header
        activeLink={'/open-source'}
        accentColor="var(--ifm-color-primary)"
      />
      {children}
      <FooterExtended
        resources={[
          {
            children: 'Getting Started',
            title: 'Get started',
            href: '/docs/get-started',
          },
          {
            children: 'Essentials',
            title: 'Learn about Essentials',
            href: '/docs/essentials/type-definitions',
          },
          {
            children: 'Dependency Injection',
            title: 'Learn about Dependency Injection',
            href: '/docs/di/introduction',
          },
          {
            children: 'Advanced',
            title: 'Learn about Advanced',
            href: '/docs/advanced/subscriptions',
          },
          {
            children: 'Recipes',
            title: 'Learn about Recipes',
            href: '/docs/recipes/dataloader',
          },
        ]}
      />
    </ThemeProvider>
  );
}

export default Root;
