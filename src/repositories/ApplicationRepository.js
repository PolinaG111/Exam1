const db = require("../config/database");

class ApplicationRepository {
  create({ userId, transportType, startDate, paymentMethod }) {
    const result = db
      .prepare(
        `INSERT INTO applications (user_id, transport_type, start_date, payment_method)
         VALUES (@userId, @transportType, @startDate, @paymentMethod)`
      )
      .run({
        userId,
        transportType,
        startDate,
        paymentMethod,
      });

    return this.findById(result.lastInsertRowid);
  }

  findById(id) {
    return db
      .prepare(
        `SELECT id, user_id AS userId, transport_type AS transportType, start_date AS startDate,
                payment_method AS paymentMethod, status, created_at AS createdAt
         FROM applications
         WHERE id = ?`
      )
      .get(id);
  }

  findByUserId(userId) {
    return db
      .prepare(
        `SELECT a.id,
                a.transport_type AS transportType,
                a.start_date AS startDate,
                a.payment_method AS paymentMethod,
                a.status,
                a.created_at AS createdAt,
                r.id AS reviewId,
                r.rating AS reviewRating,
                r.content AS reviewContent,
                r.created_at AS reviewCreatedAt
         FROM applications a
         LEFT JOIN reviews r ON r.application_id = a.id
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC`
      )
      .all(userId);
  }

  findCompletedByUserId(userId) {
    return db
      .prepare(
        `SELECT a.id, a.transport_type AS transportType, a.start_date AS startDate
         FROM applications a
         LEFT JOIN reviews r ON r.application_id = a.id
         WHERE a.user_id = ?
           AND a.status = 'Обучение завершено'
           AND r.id IS NULL
         ORDER BY a.created_at DESC`
      )
      .all(userId);
  }

  findAllWithUsers() {
    return db
      .prepare(
        `SELECT a.id,
                a.transport_type AS transportType,
                a.start_date AS startDate,
                a.payment_method AS paymentMethod,
                a.status,
                a.created_at AS createdAt,
                u.full_name AS fullName,
                u.login,
                u.phone,
                u.email
         FROM applications a
         INNER JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC`
      )
      .all();
  }

  findAdminPage({ status, transportType, search, sortBy, sortDir, page, pageSize }) {
    const conditions = [];
    const params = {};

    if (status) {
      conditions.push("a.status = @status");
      params.status = status;
    }

    if (transportType) {
      conditions.push("a.transport_type = @transportType");
      params.transportType = transportType;
    }

    if (search) {
      conditions.push(
        "(u.full_name LIKE @search OR u.login LIKE @search OR u.phone LIKE @search OR u.email LIKE @search)"
      );
      params.search = `%${search}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderMap = {
      createdAt: "a.created_at",
      startDate: "a.start_date",
      fullName: "u.full_name",
      status: "a.status",
      transportType: "a.transport_type",
    };
    const orderField = orderMap[sortBy] || orderMap.createdAt;
    const orderDirection = sortDir === "asc" ? "ASC" : "DESC";
    const offset = (page - 1) * pageSize;

    const total = db
      .prepare(
        `SELECT COUNT(*) AS total
         FROM applications a
         INNER JOIN users u ON u.id = a.user_id
         ${whereClause}`
      )
      .get(params).total;

    const items = db
      .prepare(
        `SELECT a.id,
                a.transport_type AS transportType,
                a.start_date AS startDate,
                a.payment_method AS paymentMethod,
                a.status,
                a.created_at AS createdAt,
                u.full_name AS fullName,
                u.login,
                u.phone,
                u.email
         FROM applications a
         INNER JOIN users u ON u.id = a.user_id
         ${whereClause}
         ORDER BY ${orderField} ${orderDirection}
         LIMIT @pageSize OFFSET @offset`
      )
      .all({
        ...params,
        pageSize,
        offset,
      });

    return {
      items,
      total,
    };
  }

  updateStatus(id, status) {
    db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
    return this.findById(id);
  }
}

module.exports = new ApplicationRepository();
