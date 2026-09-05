import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    destination: { type: 'string' },
    source: { type: 'string' },
    medium: { type: 'string' },
    campaign: { type: 'string' },
    content: { type: 'string' },
    term: { type: 'string' },
  },
});
for (const key of ['destination', 'source', 'medium', 'campaign', 'content'])
  if (!values[key]) throw new Error(`Missing --${key}`);
const base = new URL(process.env.SITE_URL || 'http://localhost:4321');
const destination = new URL(values.destination, base);
if (destination.origin !== base.origin) throw new Error('Destination must be on SITE_URL origin.');
for (const key of ['source', 'medium', 'campaign', 'content', 'term'])
  if (values[key]) destination.searchParams.set(`utm_${key}`, values[key]);
console.log(destination.toString());
