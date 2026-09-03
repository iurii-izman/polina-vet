import * as React from 'react';

const memoSentinel = Symbol.for('react.memo_cache_sentinel');

/**
 * Preview-only ESM bridge for the React Compiler runtime used by Sanity's
 * Visual Editing bundle. React 19 ships this entry as CommonJS, which Vite's
 * browser graph cannot import as a named export in this preview server.
 */
export function c(size: number) {
  return React.useMemo(() => {
    const cache = new Array(size);
    for (let index = 0; index < size; index += 1) cache[index] = memoSentinel;
    cache[memoSentinel as unknown as number] = true;
    return cache;
  }, [size]);
}
