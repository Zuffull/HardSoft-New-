import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Ім’я</label>
      <input id="name" name="name" placeholder="Введіть ім’я" />

      <button type="submit">Відправити</button>

      {submitted && <p>Форму надіслано!</p>}
    </form>
  );
}
