import './globals.css'

export const metadata = {
  title: 'Mediflow | AI Medical Assistant',
  description: 'Advanced medical analysis and consultation system.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
