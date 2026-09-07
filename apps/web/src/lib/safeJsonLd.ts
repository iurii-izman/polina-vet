/** Serialize JSON for an HTML script body without allowing </script> breakout. */
export function safeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return 'null';
  return serialized.replace(/[<>&\u2028\u2029]/g, (character) => {
    switch (character) {
      case '<':
        return '\\u003C';
      case '>':
        return '\\u003E';
      case '&':
        return '\\u0026';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
      default:
        return character;
    }
  });
}
