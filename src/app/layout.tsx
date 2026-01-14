import "@/app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full w-full overflow-x-hidden relative antialiased">
        <div className="h-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
