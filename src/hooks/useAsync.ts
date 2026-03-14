"use client";

import { useCallback, useEffect, useState } from "react";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  options?: UseAsyncOptions
) => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      options?.onError?.(error);
      throw error;
    }
  }, [asyncFunction, options]);

  return { ...state, execute };
};

export const useFetch = <T,>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  options?: UseAsyncOptions
) => {
  const { execute, ...state } = useAsync(asyncFunction, options);

  // Execute on mount and when dependencies change
  useEffect(() => {
    execute();
  }, dependencies);

  return state;
};
