import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

function parseDatabaseUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    return {
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: url.username || 'root',
      password: url.password || '',
      database: url.pathname.replace(/^\//, '') || 'honda_bikes_store',
    };
  } catch {
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'honda_bikes_store',
    };
  }
}

export const dbConfig = parseDatabaseUrl(config.DATABASE_URL);

export const rawPool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: config.DB_POOL_MAX || 10,
  queueLimit: 0,
});

/**
 * Normalizes SQL queries from PostgreSQL syntax to MySQL syntax:
 * - Replaces $1, $2, etc. with ?
 * - Replaces = ANY(...) with IN (...)
 * - Replaces ILIKE with LIKE
 * - Replaces ::int, ::text, etc. casts
 */
export function normalizeSql(sql) {
  return sql
    .replace(/\s+FOR\s+SHARE\b/gi, '')
    .replace(/\s*=\s*ANY\s*\(\s*\$\d+\s*\)/gi, ' IN (?)')
    .replace(/\s*=\s*ANY\s*\(\s*\?\s*\)/gi, ' IN (?)')
    .replace(/\$\d+/g, '?')
    .replace(/\bILIKE\b/gi, 'LIKE')
    .replace(/::(int|text|numeric|bigint)/gi, '')
    .replace(/\s+RETURNING\s+[\s\S]*$/gi, '');
}

/**
 * Compatibility wrapper to match PostgreSQL pg.Pool API ({ rows, rowCount, insertId }).
 */
export const pool = {
  async query(sql, params = []) {
    const cleanSql = normalizeSql(sql);
    const [result] = await rawPool.query(cleanSql, params);
    if (Array.isArray(result)) {
      return {
        rows: result,
        rowCount: result.length,
      };
    }
    return {
      rows: [],
      rowCount: result.affectedRows || 0,
      insertId: result.insertId,
    };
  },
  async end() {
    await rawPool.end();
  },
};

/**
 * Health check helper executing a fast ping query.
 */
export async function checkDatabaseHealth() {
  try {
    const [rows] = await rawPool.query('SELECT 1 AS healthy');
    return Boolean(rows && rows.length > 0);
  } catch {
    return false;
  }
}
