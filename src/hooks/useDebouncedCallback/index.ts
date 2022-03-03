import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebouncedCallback<Variables = unknown, Data = unknown>({
  callback,
  delay = 500,
}: {
  callback: (variables: Variables) => Promise<Data> | Data;
  delay?: number;
}): { trigger: (variables?: Variables) => void; data: Data } {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const [data, setData] = useState(null);

  const trigger = useCallback(
    async (variables: Variables) => {
      clearTimeout(timeoutRef.current);
      const result = await new Promise((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          resolve(await callbackRef.current(variables));
        }, delay);
      });
      setData(result);
    },
    [delay]
  );

  // Clear on unmount
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return {
    trigger,
    data,
  };
}
