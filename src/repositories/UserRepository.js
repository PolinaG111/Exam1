const db = require("../config/database");

class UserRepository {
  create({ login, passwordHash, fullName, birthDate, phone, email }) {
    const result = db
      .prepare(
        `INSERT INTO users (login, password_hash, full_name, birth_date, phone, email)
         VALUES (@login, @passwordHash, @fullName, @birthDate, @phone, @email)`
      )
      .run({
        login,
        passwordHash,
        fullName,
        birthDate,
        phone,
        email,
      });

    return this.findById(result.lastInsertRowid);
  }

  findByLogin(login) {
    return db
      .prepare(
        `SELECT id, login, password_hash AS passwordHash, full_name AS fullName,
                birth_date AS birthDate, phone, email, created_at AS createdAt
         FROM users
         WHERE login = ?`
      )
      .get(login);
  }

  findById(id) {
    return db
      .prepare(
        `SELECT id, login, full_name AS fullName, birth_date AS birthDate,
                phone, email, created_at AS createdAt
         FROM users
         WHERE id = ?`
      )
      .get(id);
  }
}

module.exports = new UserRepository();
