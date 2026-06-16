const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/UserRepository");

class AuthService {
  async registerUser({ login, password, fullName, birthDate, phone, email }) {
    const existingUser = userRepository.findByLogin(login);

    if (existingUser) {
      throw new Error("Пользователь с таким логином уже существует.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return userRepository.create({
      login,
      passwordHash,
      fullName,
      birthDate,
      phone,
      email,
    });
  }

  async authenticateUser(login, password) {
    const user = userRepository.findByLogin(login);

    if (!user) {
      throw new Error("Пользователь с таким логином не найден.");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error("Неверный пароль. Проверьте введенные данные.");
    }

    return userRepository.findById(user.id);
  }
}

module.exports = new AuthService();
