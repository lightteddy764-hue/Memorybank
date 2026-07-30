import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/utils/supabase/server';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure they can only delete their own keys

    if (error) {
      console.error('Failed to revoke master key:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
