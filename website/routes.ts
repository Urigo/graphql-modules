import { GenerateRoutes, IRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
  const Routes: IRoutes = {
    _: {
      docs: {
        $name: 'Docs',
        $routes: [
          'index',
          'get-started',
          'essentials',
          'di',
          'advanced',
          'recipes',
          'api',
        ],
        _: {
          essentials: {
            $name: 'Essentials',
            $routes: [
              'type-definitions',
              'resolvers',
              'context',
              'type-safety',
              'testing',
            ],
          },
          di: {
            $name: 'Dependency Injection',
            $routes: ['introduction', 'providers', 'scopes'],
          },
          advanced: {
            $name: 'Advanced',
            $routes: [
              'subscriptions',
              'middlewares',
              'execution-context',
              'lifecycles',
            ],
          },
          recipes: {
            $name: 'Recipes',
            $routes: ['dataloader', 'migration'],
          },
        },
      },
    },
  };

  GenerateRoutes({
    Routes,
    folderPattern: 'docs',
    basePath: 'docs',
  });

  return Routes
}
