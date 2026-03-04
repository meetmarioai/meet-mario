export const metadata = {
  title: 'Meet Mario',
  description: 'MediBalans Precision Medicine',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}