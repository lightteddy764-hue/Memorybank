'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { supabaseAdmin, createClient } from '@/utils/supabase/server'

export async function getUserIp() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
}

export async function createProject(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return { error: 'Missing Render Env Var: Please add NEXT_PUBLIC_SUPABASE_URL to your Render dashboard settings!' };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
    return { error: 'Missing Render Env Var: Please add SUPABASE_SERVICE_ROLE_KEY to your Render dashboard settings!' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a project' };
  }

  const ip = await getUserIp();
  
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return { error: 'Project name is required' }
  }

  const { error } = await supabaseAdmin
    .from('projects')
    .insert([
      { name, description, user_ip: ip, user_id: user.id }
    ])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
