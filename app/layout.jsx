import './globals.css';

export const metadata = {
  title: '81CC Casino',
  description: 'A premium mobile casino experience',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
