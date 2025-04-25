import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from './ContactForm';

test('форма рендериться і відправляється', () => {
  render(<ContactForm />);

  // перевірка наявності полів
  expect(screen.getByLabelText(/ім’я/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /відправити/i })).toBeInTheDocument();

  // взаємодія
  fireEvent.change(screen.getByLabelText(/ім’я/i), {
    target: { value: 'Софія' },
  });
  fireEvent.click(screen.getByRole('button', { name: /відправити/i }));

  // перевірка результату
  expect(screen.getByText(/форму надіслано!/i)).toBeInTheDocument();
});
