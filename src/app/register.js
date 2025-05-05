import bcrypt from 'bcryptjs'; // Для хешування паролів
import { prisma } from '../../lib/prisma'; // База даних через Prisma або будь-який інший ORM

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Перевірка на наявність користувача
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з таким email вже існує' });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return res.status(200).json(newUser); // Повертаємо нового користувача
    } catch (error) {
      return res.status(500).json({ error: 'Сталася помилка при реєстрації' });
    }
  }

  return res.status(405).json({ error: 'Метод не дозволений' });
}
