// src/app/layout.js
import '../globals.css';

export const metadata = {
  title: 'HardSoft',
  description: 'Інтернет-магазин компʼютерної техніки',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
