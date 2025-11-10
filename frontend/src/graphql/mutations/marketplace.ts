// 🎯🎸💀 GRAPHQL MUTATIONS - MARKETPLACE V3.0
/**
 * GraphQL Mutations for Marketplace V3.0
 *
 * 🎯 MISSION: B2B Dental Supply operations
 * ✅ Shopping cart management
 * ✅ Product catalog operations
 * ✅ Checkout and ordering
 */

import { gql } from '@apollo/client';

// ============================================================================
// SHOPPING CART MUTATIONS
// ============================================================================

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInputV3!) {
    addToCartV3(input: $input) {
      id
      userId
      productId
      quantity
      unitPrice
      totalPrice
      notes
      addedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($id: ID!, $quantity: Int!) {
    updateCartItemV3(id: $id, quantity: $quantity) {
      id
      quantity
      totalPrice
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($id: ID!) {
    removeFromCartV3(id: $id)
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($userId: ID!) {
    clearCartV3(userId: $userId)
  }
`;

export const CHECKOUT_CART = gql`
  mutation CheckoutCart {
    checkoutCartV3 {
      id
      orderNumber
      supplierId
      status
      orderDate
      estimatedDeliveryDate
      total
      createdAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

// ============================================================================
// MARKETPLACE PRODUCT MUTATIONS
// ============================================================================

export const CREATE_MARKETPLACE_PRODUCT = gql`
  mutation CreateMarketplaceProduct($input: MarketplaceProductV3CreateInput!) {
    createMarketplaceProductV3(input: $input) {
      id
      name
      description
      category
      sku
      price
      supplierId
      inStock
      minimumOrderQuantity
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MARKETPLACE_PRODUCT = gql`
  mutation UpdateMarketplaceProduct($id: UUID!, $input: MarketplaceProductV3UpdateInput!) {
    updateMarketplaceProductV3(id: $id, input: $input) {
      id
      name
      description
      price
      inStock
      minimumOrderQuantity
      updatedAt
    }
  }
`;

export const DELETE_MARKETPLACE_PRODUCT = gql`
  mutation DeleteMarketplaceProduct($id: UUID!) {
    deleteMarketplaceProductV3(id: $id)
  }
`;
