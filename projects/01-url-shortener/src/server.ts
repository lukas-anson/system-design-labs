import express from 'express';

const PORT = 3000;
const app = express();
const BASE62_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(BASE62_ALPHABET.length);

function base62Digit(value: bigint): string {
  const digit = BASE62_ALPHABET[Number(value)];
  if (digit === undefined)
    throw new RangeError(`Not a base62 digit value: ${value}`);
  return digit;
}

function toBase62(n: bigint): string {
  if (n < 0n) {
    throw new RangeError(`toBase62 expects a non-negative id, got ${n}`);
  }
  if (n === 0n) {
    return base62Digit(0n);
  }
  const digits: string[] = [];
  let remaining = n;
  while (remaining > 0n) {
    digits.push(base62Digit(remaining % BASE));
    remaining /= BASE;
  }
  return digits.reverse().join('');
}

type Link = { url: string; clicks: number };

const links = new Map<string, Link>();
let nextId = 1n;

function parseHttpUrl(input: unknown): URL | null {
  if (typeof input !== 'string') return null;
  const url = URL.parse(input);
  if (url === null) return null;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url;
}

app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/links', (req, res) => {
  const url = parseHttpUrl(req.body?.url);
  if (url === null) {
    res.status(400).json({ error: 'url must be an absolute http(s) URL' });
    return;
  }

  const code = toBase62(nextId++);
  links.set(code, { url: url.href, clicks: 0 });
  res.status(201).json({ code, shortUrl: `http://localhost:${PORT}/${code}` });
});

app.get('/links/:code/stats', (req, res) => {
  const { code } = req.params;
  const link = links.get(code);
  if (link === undefined) {
    res.status(404).json({ error: 'link not found' });
    return;
  }
  res.json({ code, url: link.url, clicks: link.clicks });
});

app.get('/:code', (req, res) => {
  const link = links.get(req.params.code);
  if (link === undefined) {
    res.status(404).json({ error: 'link not found' });
    return;
  }

  link.clicks++;
  res.redirect(302, link.url);
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
