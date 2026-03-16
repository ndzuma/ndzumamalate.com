export const metadata = {
  title: "ndzumamalate.com",
  description: "Personal website project scaffold"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
