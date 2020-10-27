import 'reflect-metadata';
import {
  createApplication,
  createModule,
  Injectable,
  Scope,
  ExecutionContext,
  gql,
} from '../src';
import { parse } from 'graphql';

const posts = ['Foo', 'Bar'];

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

test('ExecutionContext on module level global provider', async () => {
  const spies = {
    posts: jest.fn(),
    executionContext: jest.fn(),
  };

  @Injectable({
    scope: Scope.Singleton,
    global: true,
  })
  class Posts {
    @ExecutionContext()
    context!: ExecutionContext;

    constructor() {
      spies.posts();
    }

    all() {
      spies.executionContext(this.context);

      return [];
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
    providers: [Posts],
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

  const expectedData = {
    posts: [],
  };

  const contextValue = createContext();

  const result = await app.createExecution()({
    schema: app.schema,
    contextValue,
    document,
  });

  expect(result.data).toEqual(expectedData);
  expect(spies.posts).toBeCalledTimes(1);
  expect(spies.executionContext).toHaveBeenCalledTimes(1);
  expect(spies.executionContext).toHaveBeenCalledWith(
    expect.objectContaining(contextValue)
  );
});

test('ExecutionContext on application level global provider', async () => {
  const spies = {
    posts: jest.fn(),
    executionContext: jest.fn(),
  };

  @Injectable({
    scope: Scope.Singleton,
    global: true,
  })
  class Posts {
    @ExecutionContext()
    context!: ExecutionContext;

    constructor() {
      spies.posts();
    }

    all() {
      spies.executionContext(this.context);

      return [];
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
    providers: [Posts],
  });

  const createContext = () => ({ noop() {} });
  const document = parse(/* GraphQL */ `
    {
      posts {
        title
      }
    }
  `);

  const expectedData = {
    posts: [],
  };

  const contextValue = createContext();

  const result = await app.createExecution()({
    schema: app.schema,
    contextValue,
    document,
  });

  expect(result.data).toEqual(expectedData);
  expect(spies.posts).toBeCalledTimes(1);
  expect(spies.executionContext).toHaveBeenCalledTimes(1);
  expect(spies.executionContext).toHaveBeenCalledWith(
    expect.objectContaining(contextValue)
  );
});
