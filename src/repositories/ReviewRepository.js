const db = require("../config/database");

class ReviewRepository {
  create({ userId, applicationId, rating, content }) {
    const result = db
      .prepare(
        `INSERT INTO reviews (user_id, application_id, rating, content)
         VALUES (@userId, @applicationId, @rating, @content)`
      )
      .run({
        userId,
        applicationId,
        rating,
        content,
      });

    return this.findById(result.lastInsertRowid);
  }

  findById(id) {
    return db
      .prepare(
        `SELECT id, user_id AS userId, application_id AS applicationId, rating, content,
                created_at AS createdAt
         FROM reviews
         WHERE id = ?`
      )
      .get(id);
  }

  findByUserId(userId) {
    return db
      .prepare(
        `SELECT r.id,
                r.rating,
                r.content,
                r.created_at AS createdAt,
                a.transport_type AS transportType,
                a.start_date AS startDate
         FROM reviews r
         INNER JOIN applications a ON a.id = r.application_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`
      )
      .all(userId);
  }
}

module.exports = new ReviewRepository();
