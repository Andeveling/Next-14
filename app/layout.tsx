import "@/app/ui/global.css"
import { inter } from "./ui/fonts"
import { Metadata } from "next"

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: {
    default: "Acme Dashboard",
    template: "%s | Acme Dashboard",
  },
  description: "The official Next.js Course Dashboard, built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
}

export default function RootLayout({ children }:  Props ) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
