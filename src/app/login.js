import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Перевірка на існування користувача
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Користувача не знайдено' });
    }

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Невірний пароль' });
    }

    return res.status(200).json({ message: 'Успішний вхід', user });
  }

  return res.status(405).json({ error: 'Метод не дозволений' });
}
