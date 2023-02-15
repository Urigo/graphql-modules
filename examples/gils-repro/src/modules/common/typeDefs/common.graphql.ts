import { gql } from 'graphql-modules';

export default gql`
  " query root "
  type Query {
    ping: Boolean
  }

  " mutation root "
  type Mutation {
    pong: Boolean
  }
`;
