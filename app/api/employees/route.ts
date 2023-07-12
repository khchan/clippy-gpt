import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Create a Supabase client configured to use cookies
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: employees } = await supabase.from('employees').select()

  return NextResponse.json(employees)
}
