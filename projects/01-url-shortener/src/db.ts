import pg from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgres://shortener:shortener@localhost:5432/shortener';

export const pool = new pg.Pool({ connectionString: DATABASE_URL });

pool.on('error', (error) => {
  console.error('Unexpected error on idle Postgres client', error);
});
