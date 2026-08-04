// app/boss/employees/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/getUserRole'
import EmployeesPanel from '@/components/EmployeesPanel'

export default async function EmployeesPage() {
  const { role } = await getUserRole()
  if (role !== 'boss') {
    redirect('/deals')
  }

  const supabase = createClient()
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, created_at')
    .eq('role', 'sales')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Employees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a username and password for a new rep, or reset an existing one — no email address needed.
        </p>
      </div>
      <EmployeesPanel initialEmployees={employees ?? []} />
    </div>
  );
}
