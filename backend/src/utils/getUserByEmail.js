async function getUserByEmail(Email, pool) {
  try {
    if (pool._connected) {
      const query = `SELECT * FROM Users WHERE "email" = $1`;
      const { rows } = await pool.query(query, [Email]);
      if (rows.length === 0) {
        throw new Error("User not found");
      }

      const user = rows[0];
      return user;
    } else {
      throw new Error("Database connection is not established");
    }
  } catch (error) {
    throw error;
  }
}

module.exports = getUserByEmail;
