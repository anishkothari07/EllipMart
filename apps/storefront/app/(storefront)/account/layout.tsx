export const dynamic = 'force-dynamic';
import { Container } from '@corecart/ui'
import { Breadcrumb } from '@corecart/ui'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { getCurrentUser } from '@corecart/shared/src/auth'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <Container className="py-6 sm:py-8 lg:py-10 w-full min-w-0 max-w-full">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr] w-full min-w-0 max-w-full">
        <AccountSidebar user={user} />
        <div className="min-w-0 w-full max-w-full">{children}</div>
      </div>
    </Container>
  )
}
