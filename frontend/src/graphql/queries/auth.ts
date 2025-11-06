// frontend/src/graphql/queries/auth.ts
import { gql } from '@apollo/client';

// Note: GraphQL schema doesn't have 'me' query, using health check instead
// User info is obtained through REST login response
export const GET_ME_QUERY = gql`
  query GetHealth {
    health
  }
`;