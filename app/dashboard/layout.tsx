import SideNav from "../ui/dashboard/sidenav"
import { Metadata } from "next"

type Props = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: {
    default: "Invoices",
    template: "%s | Invoices",
  },
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className='flex h-screen flex-col md:flex-row md:overflow-hidden'>
      <div className='w-full flex-none md:w-64'>
        <SideNav />
      </div>
      <div className='flex-grow p-6 md:overflow-y-auto md:p-12'>{children}</div>
    </div>
  )
}
