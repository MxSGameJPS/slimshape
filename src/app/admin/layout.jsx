import "../globals.css";

export default function AdminLayout({ children }) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
