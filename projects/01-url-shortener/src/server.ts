import express, { type ErrorRequestHandler } from 'express';
import { pool } from './db.ts';

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

function parseHttpUrl(input: unknown): URL | null {
  if (typeof input !== 'string') return null;
  const url = URL.parse(input);
  if (url === null) return null;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url;
}

app.use(express.json());

app.get('/healthz', async (_req, res) => {
  await pool.query('select 1');
  res.json({ status: 'ok', database: 'ok' });
});

app.post('/links', async (req, res) => {
  const url = parseHttpUrl(req.body?.url);
  if (url === null) {
    res.status(400).json({ error: 'url must be an absolute http(s) URL' });
    return;
  }

  const idResult = await pool.query<{ id: string }>(
    "select nextval(pg_get_serial_sequence('links', 'id')) as id",
  );
  const id = idResult.rows[0]?.id;
  if (id === undefined) throw new Error('nextval returned no row');

  const code = toBase62(BigInt(id));
  await pool.query('insert into links (id, code, url) values ($1, $2, $3)', [
    id,
    code,
    url.href,
  ]);

  res.status(201).json({ code, shortUrl: `http://localhost:${PORT}/${code}` });
});

app.get('/links/:code/stats', async (req, res) => {
  const { code } = req.params;
  const result = await pool.query<{ url: string; clicks: number }>(
    `select url,
            (select count(*) from clicks where clicks.link_id = links.id)::int as clicks
       from links
      where code = $1`,
    [code],
  );
  const link = result.rows[0];
  if (link === undefined) {
    res.status(404).json({ error: 'link not found' });
    return;
  }

  res.json({ code, url: link.url, clicks: link.clicks });
});

app.get('/:code', async (req, res) => {
  const result = await pool.query<{ id: string; url: string }>(
    'select id, url from links where code = $1',
    [req.params.code],
  );
  const link = result.rows[0];
  if (link === undefined) {
    res.status(404).json({ error: 'link no found' });
    return;
  }

  await pool.query('insert into clicks (link_id) values ($1)', [link.id]);
  res.redirect(302, link.url);
});

function clientErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return null;
  }
  const { status } = error;
  if (typeof status !== 'number' || status < 400 || status >= 500) return null;

  return status;
}

const handleError: ErrorRequestHandler = (error, _seq, res, next) => {
  if (res.headersSent) {
    next(error); // what does next do?
    return;
  }

  const status = clientErrorStatus(error);
  if (status !== null) {
    res.status(status).json({ error: 'invalid request' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'internal server error' });
};

app.use(handleError);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
