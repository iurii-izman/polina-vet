const reactElementType = Symbol.for('react.element');
const reactMemoType = Symbol.for('react.memo');
const reactForwardRefType = Symbol.for('react.forward_ref');
const reactLazyType = Symbol.for('react.lazy');
const reactContextType = Symbol.for('react.context');
const reactConsumerType = Symbol.for('react.consumer');

export function isValidElementType(type: unknown) {
  if (typeof type === 'string' || typeof type === 'function') return true;
  if (typeof type !== 'object' || type === null) return false;
  const marker = (type as { $$typeof?: symbol }).$$typeof;
  return (
    marker === reactElementType ||
    marker === reactMemoType ||
    marker === reactForwardRefType ||
    marker === reactLazyType ||
    marker === reactContextType ||
    marker === reactConsumerType
  );
}

export default { isValidElementType };
