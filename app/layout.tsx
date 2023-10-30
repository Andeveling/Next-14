import "@/app/ui/global.css"
import { inter } from "./ui/fonts"

type Props = {
  children: React.ReactNode
}
export default function RootLayout({ children }:  Props ) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
