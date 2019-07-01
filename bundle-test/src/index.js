import { GraphQLModule } from '@graphql-modules/core';

const { schema } = new GraphQLModule({
    typeDefs: `
        type Query {
            test: String
        }
    `,
    resolvers: {
        Query: {
            test: () => 'TEST'
        }
    }
});

console.log(schema);

