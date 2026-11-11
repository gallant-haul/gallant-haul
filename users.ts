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

  // 1. GET: List users
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      const users = (data?.users || []).map((u) => {
        const meta = u.user_metadata || {};
        const role = meta.role || (u.email?.includes('driver') ? 'driver' : 'client');
        return {
          id: u.id,
          email: u.email,
          role,
          fullName:
            meta.full_name ||
            meta.company_name ||
            (role === 'driver' ? 'Driver Candidate' : 'Shipper Client'),
          companyName: meta.company_name || meta.full_name || '',
          contactName: meta.contact_name || meta.full_name || '',
          phone: meta.phone || '',
          licenseClass: meta.license_class || 'Class 1 / CDL-A',
          status: meta.status || 'Active',
          licenceDoc: meta.licence_doc,
          pictureDoc: meta.picture_doc,
          residenceDoc: meta.residence_doc,
          docsSubmittedAt: meta.docs_submitted_at,
          notes: meta.notes || '',
          createdAt: u.created_at,
          confirmed: !!u.email_confirmed_at,
        };
      });

      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. POST: Create user
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { email, password, role, metadata } = body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const tempPassword =
        password && password.trim()
          ? password.trim()
          : `Gallant${Math.floor(100000 + Math.random() * 900000)}!`;

      if (password && password.trim().length < 6) {
        return res
          .status(400)
          .json({ success: false, error: 'Password must be at least 6 characters.' });
      }

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            ...metadata,
            role: role || 'client',
            created_by: 'master-admin',
          },
        });

      if (createError) {
        if (createError.message.toLowerCase().includes('already') || createError.message.toLowerCase().includes('registered')) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          const existing = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (existing) {
            const updatePayload: any = {
              email_confirm: true,
              user_metadata: {
                ...(existing.user_metadata || {}),
                role: role || 'client',
                ...(metadata || {}),
              },
            };
            if (password && password.trim()) {
              updatePayload.password = password.trim();
            }
            const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, updatePayload);
            if (!updateErr && updated?.user) {
              return res.json({
                success: true,
                user: updated.user,
                message: `Existing user upgraded to ${role} in Supabase DB!`,
              });
            }
          }
        }
        return res.status(400).json({ success: false, error: createError.message });
      }

      return res.json({
        success: true,
        user: newUser?.user,
        tempPassword,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. DELETE: Delete user (by query ?id=... or body)
  if (req.method === 'DELETE') {
    try {
      const id = req.query?.id || (typeof req.body === 'string' ? JSON.parse(req.body)?.id : req.body?.id);
      if (!id) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error && !error.message.toLowerCase().includes('not found')) {
          return res.status(400).json({ success: false, error: error.message });
        }
      }

      return res.json({ success: true, deletedId: id });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. PUT: Update user
  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const id = req.query?.id || body.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      const updates: any = {};
      if (body.password && body.password.trim().length >= 6) {
        updates.password = body.password.trim();
      }
      if (body.metadata) {
        updates.user_metadata = body.metadata;
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json({ success: true, user: data?.user });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
