import { useState, useEffect } from 'react';

const useDebouncedState = <T>(initialState: T, delay: number): [T, (state: T) => void] => {
  const [state, setState] = useState<T>(initialState);
  const [debouncedState, setDebouncedState] = useState<T>(initialState);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state, delay]);

  return [debouncedState, setState];
};

export default useDebouncedState;