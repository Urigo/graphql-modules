import { gql } from 'graphql-modules';

export default gql`
  extend type Query {
    chargeById(id: ID!): Charge!
  }

  " represrent a complex type for grouped charge with ledger info, bank/card transactions and documents "
  type Charge {
    id: ID!
  }
`;
