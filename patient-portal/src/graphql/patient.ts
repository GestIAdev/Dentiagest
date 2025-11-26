/**
 * 🏥 PATIENT GRAPHQL OPERATIONS
 * Operaciones relacionadas con el paciente en VitalPass
 * By PunkClaude - Directiva #007.6 Wallet Persistence
 */

import { gql } from '@apollo/client';

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * 🔗 UPDATE PATIENT WALLET
 * Persiste la wallet address del paciente en la base de datos
 * Se llama automáticamente cuando el paciente conecta MetaMask
 */
export const UPDATE_PATIENT_WALLET_MUTATION = gql`
  mutation UpdatePatientWallet($walletAddress: String!) {
    updatePatientWallet(walletAddress: $walletAddress) {
      id
      firstName
      lastName
      walletAddress
    }
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export interface UpdatePatientWalletInput {
  walletAddress: string;
}

export interface UpdatePatientWalletResponse {
  updatePatientWallet: {
    id: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
  };
}
