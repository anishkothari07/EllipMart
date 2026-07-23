import { Container } from '@/components/shared/container'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <Container className="py-8 lg:py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <AccountSidebar user={user} />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  )
}
