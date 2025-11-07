// Simple Financial GraphQL Hooks - V3.0
import { useState, useCallback } from 'react';
import { apolloClient } from '../apollo/graphql-client';
import { GET_INVOICES, CREATE_INVOICE, CREATE_PAYMENT } from '../graphql/queries/financial';

export const useInvoices = (variables?: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apolloClient.query({
        query: GET_INVOICES,
        variables
      });
      setData(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [variables]);

  return { data, loading, error, refetch: fetchInvoices };
};

export const useCreateInvoice = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const createInvoice = useCallback(async (input: any) => {
    setLoading(true);
    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_INVOICE,
        variables: { input }
      });
      return (result.data as any) && (result.data as any).createInvoice;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createInvoice, loading };
};

export const useCreatePayment = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const createPayment = useCallback(async (input: any) => {
    setLoading(true);
    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_PAYMENT,
        variables: { input }
      });
      return (result.data as any) && (result.data as any).createPayment;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPayment, loading };
};

