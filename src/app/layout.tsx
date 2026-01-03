import "@/app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen w-full overflow-x-hidden relative antialiased">
        {children}
      </body>
    </html>
  );
}
