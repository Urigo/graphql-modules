---
id: file-uploads
title: File Uploads
sidebar_label: File Uploads
---

You can transfer files between client and server using GraphQL. It is really simple as in REST. If you're using `express-graphql` as your GraphQL Server, you should install **[graphql-upload](https://github.com/jaydenseric/graphql-upload)** package. It has two things we need to add to our GraphQL Application.

## Adding Upload Feature to our GraphQL Server

You should extend your existing server in order to make it able to handle file uploads. Check the following recipes for GraphQL Express and Apollo Server.

### Adding GraphQL Upload Middleware to GraphQL Express

Let's assume we have something like the following at the beginning, and as you can see we add `graphqlUploadExpress` middleware into `/graphql` route to make it handle file uploads and pass it through the resolvers.

```ts
import { GraphQLModule } from '@graphql-modules/core';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

const { schema } = new GraphQLModule({
    /*...*/
});

const app = express();

app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    graphqlHTTP({ schema, graphiql: true })
  );

app.listen(4000);
```

### Enabling uploads in Apollo-Server

if you are using apollo-server, you don't have to add that express middleware, you just need to add `uploads` field` to your Apollo Server configuration:

```ts
import { GraphQLModule } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server';

const AppModule = new GraphQLModule({
    /*...*/
});

const server = new ApolloServer({
  modules: [
    AppModule
  ],
  context: session => session,
  uploads: {
    maxFileSize: 10000000, // 10 MB
    maxFiles: 20
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

> You can read more about upload options in **[graphql-upload](https://github.com/jaydenseric/graphql-upload#type-uploadoptions)** docs.

## Adding `Upload` scalar into the schema

**[graphql-upload](https://github.com/jaydenseric/graphql-upload)** provides you the necessary scalar implementation, so you should simply put it inside your resolvers.

In the example, we create a new module called `UploadModule` and put everything related to file uploads in it.

`upload.module.ts`

```ts
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
import { GraphQLUpload } from 'graphql-upload';

export const UploadModule = new GraphQLModule({
    typeDefs: gql`
        scalar Upload
    `,
    resolvers: {
        Upload: GraphQLUpload
    }
});
```

## Using it on other modules

Let's assume we have `ImageModule`, and we want to add a mutation to it for uploading an image to our server;

```ts
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';
import { UploadModule } from '../upload.module';

export const ImageModule = new GraphQLModule({
    imports: [
        // some other imports
        // But we should import UploadModule for file upload related schema elements
        UploadModule
    ],
    typeDefs: gql`
        type Image {
            id: ID
            name: String
            url: String
        }
        type Mutation {
            uploadImage(name: String!, file: Upload!): Boolean
        }
    `,
    resolvers: {
        Mutation: {
            uploadImage: (root, { name, file }) => {
                const { filename, mimetype, createReadStream } = await file;
                const stream = createReadStream()
                // Promisify the stream and store the file, then…
                return true;
            }
        }
    }
});
```
