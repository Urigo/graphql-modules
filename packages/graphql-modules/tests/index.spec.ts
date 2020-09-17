import 'reflect-metadata';
import {
  createApplication,
  createModule,
  MODULE_ID,
  CONTEXT,
  Injectable,
  Inject,
  InjectionToken,
  Scope,
  ExecutionContext,
  gql,
} from '../src';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { parse } from 'graphql';

const Test = new InjectionToken<string>('test');

const posts = ['Foo', 'Bar'];
const comments = ['Comment #1', 'Comment #2'];

test('should allow to add __isTypeOf to type resolvers', () => {
  const m1 = createModule({
    id: 'test',
    typeDefs: parse(
      `type Query { entity: Node } interface Node { id: ID! } type Entity implements Node { id: ID f: String }`
    ),
    resolvers: {
      Query: {
        entity: () => ({
          id: 1,
          type: 'entity',
        }),
      },
      Entity: {
        __isTypeOf: (obj: any) => obj.type === 'entity',
        id: () => 1,
        f: () => 'test',
      },
    },
  });

  expect(() => {
    createApplication({
      modules: [m1],
    });
  }).not.toThrow();
});

test('basic', async () => {
  const spies = {
    logger: jest.fn(),
    posts: {
      moduleId: jest.fn(),
      test: jest.fn(),
      postService: jest.fn(),
      eventService: jest.fn(),
    },
    comments: {
      moduleId: jest.fn(),
      test: jest.fn(),
      commentsService: jest.fn(),
    },
  };

  @Injectable({
    scope: Scope.Operation,
  })
  class Logger {
    constructor() {
      spies.logger();
    }

    log() {}
  }

  @Injectable({
    scope: Scope.Operation,
  })
  class Events {
    constructor() {
      spies.posts.eventService();
    }

    emit() {}
  }

  @Injectable()
  class Posts {
    constructor() {
      spies.posts.postService();
    }

    all() {
      return posts;
    }
  }

  @Injectable()
  class Comments {
    constructor() {
      spies.comments.commentsService();
    }

    all() {
      return comments;
    }
  }

  // Child module
  const commonModule = createModule({
    id: 'common',
    typeDefs: gql`
      type Query {
        _noop: String
      }
    `,
  });

  // Child module
  const postsModule = createModule({
    id: 'posts',
    providers: [
      Posts,
      Events,
      {
        provide: Test,
        useValue: 'local',
      },
    ],
    typeDefs: gql`
      type Post {
        title: String!
      }

      extend type Query {
        posts: [Post!]!
      }
    `,
    resolvers: {
      Query: {
        posts(
          _parent: {},
          __args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          spies.posts.moduleId(injector.get(MODULE_ID));
          spies.posts.test(injector.get(Test));
          injector.get(Events).emit();
          injector.get(Logger).log();

          return injector.get(Posts).all();
        },
      },
      Post: {
        title: (title: any) => title,
      },
    },
  });

  // Child module
  const commentsModule = createModule({
    id: 'comments',
    providers: [Comments],
    typeDefs: gql`
      type Comment {
        text: String!
      }

      extend type Query {
        comments: [Comment!]!
      }
    `,
    resolvers: {
      Query: {
        comments(
          _parent: {},
          __args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          spies.comments.moduleId(injector.get(MODULE_ID));
          spies.comments.test(injector.get(Test));
          injector.get(Logger).log();

          return injector.get(Comments).all();
        },
      },
      Comment: {
        text: (text: any) => text,
      },
    },
  });

  // root module as application
  const appModule = createApplication({
    modules: [commonModule, postsModule, commentsModule],
    providers: [
      Logger,
      {
        provide: Test,
        useValue: 'global',
      },
    ],
  });

  // create schema
  const schema = makeExecutableSchema({
    typeDefs: appModule.typeDefs,
    resolvers: appModule.resolvers,
  });

  const createContext = () => ({ request: {}, response: {} });
  const document = parse(/* GraphQL */ `
    {
      comments {
        text
      }
      posts {
        title
      }
    }
  `);

  const result = await appModule.createExecution()({
    schema,
    contextValue: createContext(),
    document,
  });

  // Should resolve data correctly
  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    comments: comments.map((text) => ({ text })),
    posts: posts.map((title) => ({ title })),
  });

  // Child Injector has priority over Parent Injector
  expect(spies.posts.test).toHaveBeenCalledWith('local');
  expect(spies.comments.test).toHaveBeenCalledWith('global');

  // Value of MODULE_ID according to module's resolver
  expect(spies.posts.moduleId).toHaveBeenCalledWith('posts');
  expect(spies.comments.moduleId).toHaveBeenCalledWith('comments');

  await appModule.createExecution()({
    schema,
    contextValue: createContext(),
    document,
  });

  // Singleton providers should be called once
  expect(spies.posts.postService).toHaveBeenCalledTimes(1);
  expect(spies.comments.commentsService).toHaveBeenCalledTimes(1);

  // Operation provider should be called twice
  expect(spies.posts.eventService).toHaveBeenCalledTimes(2);
  expect(spies.logger).toHaveBeenCalledTimes(2);
});

test('ExecutionContext on module level provider', async () => {
  const spies = {
    posts: jest.fn(),
    connection: jest.fn(),
    connectionId: jest.fn(),
  };

  @Injectable({
    scope: Scope.Singleton,
  })
  class Posts {
    @ExecutionContext()
    context!: ExecutionContext;

    constructor() {
      spies.posts();
    }

    all() {
      const connection = this.context.injector.get(PostsConnection);
      spies.connectionId(connection.id);

      return connection.all();
    }
  }

  @Injectable({
    scope: Scope.Operation,
  })
  class PostsConnection {
    id: number;

    constructor() {
      spies.connection();
      this.id = Math.random();
    }

    all() {
      return posts;
    }
  }

  const postsModule = createModule({
    id: 'posts',
    providers: [Posts, PostsConnection],
    typeDefs: gql`
      type Post {
        title: String!
      }

      type Query {
        posts: [Post!]!
      }
    `,
    resolvers: {
      Query: {
        posts(
          _parent: {},
          __args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Posts).all();
        },
      },
      Post: {
        title: (title: any) => title,
      },
    },
  });

  const app = createApplication({
    modules: [postsModule],
  });

  const createContext = () => ({ request: {}, response: {} });
  const document = parse(/* GraphQL */ `
    {
      posts {
        title
      }
    }
  `);

  const data = {
    posts: posts.map((title) => ({ title })),
  };

  const result1 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result1.data).toEqual(data);

  const result2 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result2.data).toEqual(data);

  expect(spies.posts).toBeCalledTimes(1);
  expect(spies.connection).toBeCalledTimes(2);
  expect(spies.connectionId).toBeCalledTimes(2);

  // ExecutionContext accessed in two executions
  // should equal two different connections
  expect(spies.connectionId.mock.calls[0][0]).not.toEqual(
    spies.connectionId.mock.calls[1][0]
  );
});

test('ExecutionContext on application level provider', async () => {
  const spies = {
    posts: jest.fn(),
    connection: jest.fn(),
    connectionId: jest.fn(),
  };

  @Injectable({
    scope: Scope.Singleton,
  })
  class Posts {
    @ExecutionContext()
    context!: ExecutionContext;

    constructor() {
      spies.posts();
    }

    all() {
      const connection = this.context.injector.get(PostsConnection);
      spies.connectionId(connection.id);

      return connection.all();
    }
  }

  @Injectable({
    scope: Scope.Operation,
  })
  class PostsConnection {
    id: number;

    constructor() {
      spies.connection();
      this.id = Math.random();
    }

    all() {
      return posts;
    }
  }

  const postsModule = createModule({
    id: 'posts',
    typeDefs: gql`
      type Post {
        title: String!
      }

      type Query {
        posts: [Post!]!
      }
    `,
    resolvers: {
      Query: {
        posts(
          _parent: {},
          __args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Posts).all();
        },
      },
      Post: {
        title: (title: any) => title,
      },
    },
  });

  const app = createApplication({
    modules: [postsModule],
    providers: [Posts, PostsConnection],
  });

  const createContext = () => ({ request: {}, response: {} });
  const document = parse(/* GraphQL */ `
    {
      posts {
        title
      }
    }
  `);

  const data = {
    posts: posts.map((title) => ({ title })),
  };

  const result1 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result1.data).toEqual(data);

  const result2 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result2.data).toEqual(data);

  expect(spies.posts).toBeCalledTimes(1);
  expect(spies.connection).toBeCalledTimes(2);
  expect(spies.connectionId).toBeCalledTimes(2);

  // ExecutionContext accessed in two executions
  // should equal two different connections
  expect(spies.connectionId.mock.calls[0][0]).not.toEqual(
    spies.connectionId.mock.calls[1][0]
  );
});

test('OnDestroy hook', async () => {
  const spies = {
    onDestroy: jest.fn(),
  };

  @Injectable({
    scope: Scope.Singleton,
  })
  class Posts {
    @ExecutionContext()
    context!: ExecutionContext;

    all() {
      const connection = this.context.injector.get(PostsConnection);

      return connection.all();
    }
  }

  @Injectable({
    scope: Scope.Operation,
  })
  class PostsConnection {
    id: number;

    constructor() {
      this.id = Math.random();
    }

    all() {
      return posts;
    }

    onDestroy() {
      spies.onDestroy();
    }
  }

  const postsModule = createModule({
    id: 'posts',
    providers: [Posts, PostsConnection],
    typeDefs: gql`
      type Post {
        title: String!
      }

      type Query {
        posts: [Post!]!
      }
    `,
    resolvers: {
      Query: {
        posts(
          _parent: {},
          __args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Posts).all();
        },
      },
      Post: {
        title: (title: any) => title,
      },
    },
  });

  const app = createApplication({
    modules: [postsModule],
  });

  const createContext = () => ({ request: {}, response: {} });
  const document = parse(/* GraphQL */ `
    {
      posts {
        title
      }
    }
  `);

  const data = {
    posts: posts.map((title) => ({ title })),
  };

  const result1 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result1.data).toEqual(data);
  expect(spies.onDestroy).toBeCalledTimes(1);

  const result2 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result2.data).toEqual(data);
  expect(spies.onDestroy).toBeCalledTimes(2);
});

test('useFactory with dependecies', async () => {
  const logSpy = jest.fn();

  @Injectable({
    scope: Scope.Singleton,
  })
  class Posts {
    @ExecutionContext()
    context!: ExecutionContext;

    all() {
      const connection = this.context.injector.get(PostsConnection);

      return connection.all();
    }
  }

  class PostsConnection {
    constructor(logger: Logger) {
      logger.log();
    }

    all() {
      return posts;
    }
  }

  @Injectable()
  class Logger {
    log() {
      logSpy();
    }
  }

  const postsModule = createModule({
    id: 'posts',
    providers: [
      Logger,
      Posts,
      {
        provide: PostsConnection,
        scope: Scope.Operation,
        useFactory(logger: Logger) {
          return new PostsConnection(logger);
        },
        deps: [Logger],
      },
    ],
    typeDefs: gql`
      type Post {
        title: String!
      }

      type Query {
        posts: [Post!]!
      }
    `,
    resolvers: {
      Query: {
        posts(
          _parent: {},
          __args: {},
          { injector }: GraphQLModules.ModuleContext
        ) {
          return injector.get(Posts).all();
        },
      },
      Post: {
        title: (title: any) => title,
      },
    },
  });

  const app = createApplication({
    modules: [postsModule],
  });

  const createContext = () => ({ request: {}, response: {} });
  const document = parse(/* GraphQL */ `
    {
      posts {
        title
      }
    }
  `);

  const data = {
    posts: posts.map((title) => ({ title })),
  };

  const result1 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result1.data).toEqual(data);
  expect(logSpy).toHaveBeenCalledTimes(1);

  const result2 = await app.createExecution()({
    schema: app.schema,
    contextValue: createContext(),
    document,
  });

  expect(result2.data).toEqual(data);
  expect(logSpy).toHaveBeenCalledTimes(2);
});

test('Use @Inject decorator in constructor', async () => {
  const request = new Object();
  const requestSpy = jest.fn();

  @Injectable({ scope: Scope.Operation })
  class Auth {
    constructor(@Inject(CONTEXT) private context: any) {}

    ping() {
      requestSpy(this.context.request);

      return 'pong';
    }
  }

  const mod = createModule({
    id: 'auth',
    providers: [Auth],
    typeDefs: gql`
      type Query {
        ping: String
      }
    `,
    resolvers: {
      Query: {
        ping(_: any, __: any, { injector }: GraphQLModules.ModuleContext) {
          return injector.get(Auth).ping();
        },
      },
    },
  });

  const app = createApplication({ modules: [mod] });

  const result = await app.createExecution()({
    schema: app.schema,
    contextValue: { request },
    document: parse(/* GraphQL */ `
      {
        ping
      }
    `),
  });

  expect(result.errors).not.toBeDefined();
  expect(result.data).toEqual({ ping: 'pong' });
  expect(requestSpy).toHaveBeenCalledWith(request);
});

test('Use useFactory with deps', async () => {
  const request = new Object();
  const requestSpy = jest.fn();
  const REQUEST = new InjectionToken('request');

  @Injectable({ scope: Scope.Operation })
  class Auth {
    constructor(@Inject(REQUEST) private request: any) {}

    ping() {
      requestSpy(this.request);

      return 'pong';
    }
  }

  const mod = createModule({
    id: 'auth',
    providers: [
      Auth,
      {
        provide: REQUEST,
        useFactory(ctx: any) {
          return ctx.request;
        },
        deps: [CONTEXT],
        scope: Scope.Operation,
      },
    ],
    typeDefs: gql`
      type Query {
        ping: String
      }
    `,
    resolvers: {
      Query: {
        ping(_: any, __: any, { injector }: GraphQLModules.ModuleContext) {
          return injector.get(Auth).ping();
        },
      },
    },
  });

  const app = createApplication({ modules: [mod] });

  const result = await app.createExecution()({
    schema: app.schema,
    contextValue: { request },
    document: parse(/* GraphQL */ `
      {
        ping
      }
    `),
  });

  expect(result.errors).not.toBeDefined();
  expect(result.data).toEqual({ ping: 'pong' });
  expect(requestSpy).toHaveBeenCalledWith(request);
});

test('Application allows injector access', () => {
  @Injectable()
  class SomeProvider {}
  const { injector } = createApplication({
    modules: [],
    providers: [SomeProvider],
  });
  expect(injector.get(SomeProvider)).toBeInstanceOf(SomeProvider);
});

// test("testModule testing util", async () => {
//   @Injectable()
//   class Posts {
//     all() {
//       return posts;
//     }
//   }
//   const postsModule = createModule({
//     id: "posts",
//     providers: [Posts],
//     typeDefs: gql`
//       type Post {
//         title: String!
//       }

//       extend type Query {
//         posts: [Post!]!
//       }
//     `,
//     resolvers: {
//       Query: {
//         posts(_parent: {}, __args: {}, { injector }: ModuleContext) {
//           return injector.get(Posts).all();
//         },
//       },
//       Post: {
//         title: (title: any) => title,
//       },
//     },
//   });

//   const mockedModule = testModule(postsModule);

//   const result = await execute({
//     schema: mockedModule.schema,
//     contextValue: mockedModule.context({ request: {}, response: {} }),
//     document: parse(gql`
//       {
//         posts {
//           title
//         }
//       }
//     `),
//   });

//   // Should resolve data correctly
//   expect(result.errors).toBeUndefined();
//   expect(result.data).toEqual({
//     posts: posts.map((title) => ({ title })),
//   });
// });
