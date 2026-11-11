import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  process.env.SUPABASE_URL || 'https://xwrrvvsvylbkantcjhvu.supabase.co'
)
  .replace(/^["']|["']$/g, '')
  .trim();
const supabaseSecret = (
  process.env.SUPABASE_SECRET_KEY || 'sb_secret_54yryemVNfptoxD92jCgMA_vNxO0WMW'
)
  .replace(/^["']|["']$/g, '')
  .trim();

const supabaseAdmin = createClient(supabaseUrl, supabaseSecret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { email } = body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log(`[Auto-Confirm] Processing verification for: ${cleanEmail}`);

    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[Auto-Confirm] listUsers error:', listError);
      return res.status(500).json({ success: false, error: listError.message });
    }

    const targetUser = data?.users?.find(
      (u) => u.email?.toLowerCase().trim() === cleanEmail
    );

    if (!targetUser) {
      return res.json({ success: false, message: 'User not found in Supabase auth' });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      email_confirm: true,
    });

    if (updateError) {
      console.error('[Auto-Confirm] updateUserById error:', updateError);
      return res.status(500).json({ success: false, error: updateError.message });
    }

    return res.json({ success: true, confirmed: true, userId: targetUser.id });
  } catch (err: any) {
    console.error('[Auto-Confirm] Unexpected error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
