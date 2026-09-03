export interface ArticleBodyBlock {
  _type: string;
  _key?: string;
  title?: string;
  description?: string;
  text?: string;
  items?: string[];
  children?: Array<{ _type: 'span'; _key: string; text?: string; marks?: string[] }>;
}

export type PortableTextBlock = ArticleBodyBlock & { _type: 'block'; _key: string };

export type ArticleBodySegment =
  { type: 'portable'; blocks: PortableTextBlock[] } | { type: 'medical'; block: ArticleBodyBlock };

/** Keeps authored order while grouping adjacent Portable Text blocks for list semantics. */
export function groupArticleBody(body: ArticleBodyBlock[]): ArticleBodySegment[] {
  const segments: ArticleBodySegment[] = [];
  for (const block of body) {
    if (block._type !== 'block') {
      segments.push({ type: 'medical', block });
      continue;
    }
    const previous = segments.at(-1);
    const portableBlock = block as PortableTextBlock;
    if (previous?.type === 'portable') previous.blocks.push(portableBlock);
    else segments.push({ type: 'portable', blocks: [portableBlock] });
  }
  return segments;
}
