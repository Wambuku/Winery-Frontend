import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface RetryState {
  isRetrying: boolean;
  attempts: number;
  error: Error | null;
}

export const useRetry = <T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
) => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    error: null
  });

  const retry = useCallback(async (): Promise<T | null> => {
    setState(prev => ({ ...prev, isRetrying: true, error: null }));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({ ...prev, attempts: attempt }));
        const result = await asyncFunction();
        setState({ isRetrying: false, attempts: 0, error: null });
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxAttempts;
        
        if (isLastAttempt) {
          setState({
            isRetrying: false,
            attempts: attempt,
            error: error as Error
          });
          throw error;
        }

        // Wait before next attempt with optional backoff
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    return null;
  }, [asyncFunction, maxAttempts, delay, backoff]);

  const reset = useCallback(() => {
    setState({ isRetrying: false, attempts: 0, error: null });
  }, []);

  return {
    retry,
    reset,
    ...state
  };
};

export default useRetry;