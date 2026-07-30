import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/utils/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    const keyName = name || 'Master Key';
    
    // Generate a secure API Key
    const apiKey = 'mb_' + crypto.randomBytes(24).toString('hex');

    const { data, error } = await supabaseAdmin
      .from('user_api_keys')
      .insert([
        {
          user_id: user.id,
          name: keyName,
          api_key: apiKey
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create master key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, key: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
