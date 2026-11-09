import { rawPool, normalizeSql } from './pool.js';

/**
 * Executes a callback within a managed MySQL database transaction.
 * Automatically handles beginTransaction, commit, rollback, and connection release.
 *
 * @param {Function} callback - async function receiving (client)
 * @returns {Promise<any>} result of the callback
 */
export async function withTransaction(callback) {
  const connection = await rawPool.getConnection();
  try {
    await connection.beginTransaction();

    const client = {
      async query(sql, params = []) {
        const cleanSql = normalizeSql(sql);
        const [result] = await connection.query(cleanSql, params);
        if (Array.isArray(result)) {
          return { rows: result, rowCount: result.length };
        }
        return {
          rows: [],
          rowCount: result.affectedRows || 0,
          insertId: result.insertId,
        };
      },
    };

    const result = await callback(client);
    await connection.commit();
    return result;
  } catch (err) {
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error('Error rolling back transaction:', rollbackErr.message);
    }
    throw err;
  } finally {
    connection.release();
  }
}
