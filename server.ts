import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Supabase Admin with Service Secret Key for administrative account verification
const supabaseUrl = process.env.SUPABASE_URL || 'https://xwrrvvsvylbkantcjhvu.supabase.co';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || 'sb_secret_A7pB2RTEdUpHvkod3yFamg_nQiuq6iU';
const supabaseAdmin = createClient(supabaseUrl, supabaseSecret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Configure Nodemailer Transporter for Google App Password / SMTP
function createTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  // Fallback to custom SMTP host if provided
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  return null;
}

// 1. Automated Backend Email Auto-Confirmation Endpoint
app.post('/api/auth/auto-confirm', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log(`[Auto-Confirm] Processing administrative email confirmation for: ${cleanEmail}`);

    // List users to locate target record by email
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[Auto-Confirm] listUsers error:', listError);
      return res.status(500).json({ success: false, error: listError.message });
    }

    const targetUser = data?.users?.find(
      (u) => u.email?.toLowerCase().trim() === cleanEmail
    );

    if (!targetUser) {
      console.log(`[Auto-Confirm] User with email ${cleanEmail} not found in Supabase.`);
      return res.json({ success: false, message: 'User not found in Supabase auth' });
    }

    // Administratively confirm email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      email_confirm: true,
    });

    if (updateError) {
      console.error('[Auto-Confirm] updateUserById error:', updateError);
      return res.status(500).json({ success: false, error: updateError.message });
    }

    console.log(`[Auto-Confirm] Successfully verified email for user ${cleanEmail} (${targetUser.id})`);
    return res.json({ success: true, confirmed: true, userId: targetUser.id });
  } catch (err: any) {
    console.error('[Auto-Confirm] Unexpected error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Direct Supabase Database User Management Endpoints for Admin

// GET /api/admin/users - List all users directly from Supabase Auth DB
app.get('/api/admin/users', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error('[Admin DB] Error listing users:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    const users = (data?.users || []).map((u) => {
      const meta = u.user_metadata || {};
      const role = meta.role || (u.email?.includes('driver') ? 'driver' : 'client');
      return {
        id: u.id,
        email: u.email,
        role,
        fullName: meta.full_name || meta.company_name || (role === 'driver' ? 'Driver Candidate' : 'Shipper Client'),
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
    console.error('[Admin DB] Unexpected error listing users:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/users - Create user directly in Supabase DB with auto-confirmation
app.post('/api/admin/users', async (req: Request, res: Response) => {
  try {
    const { email, password, role, metadata } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const tempPassword = password && password.trim() ? password.trim() : `Gallant${Math.floor(100000 + Math.random() * 900000)}!`;

    if (password && password.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    console.log(`[Admin DB] Creating new user in Supabase: ${cleanEmail} (role: ${role})`);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: role || 'client',
        ...(metadata || {}),
        created_at: new Date().toISOString(),
      },
    });

    if (error) {
      // If user is already registered in Supabase, update their metadata and role rather than failing
      if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('registered')) {
        console.log(`[Admin DB] User ${cleanEmail} already exists. Updating role to ${role}...`);
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

      console.error('[Admin DB] Error creating user:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log(`[Admin DB] Successfully created user in Supabase DB: ${data.user?.id}`);
    return res.json({
      success: true,
      user: data.user,
      tempPassword,
      message: `User created successfully in database!`,
    });
  } catch (err: any) {
    console.error('[Admin DB] Unexpected error creating user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/users/:id - Update user metadata/status in Supabase DB
app.put('/api/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const rawTarget = req.params.id;
    const { user_metadata, password, email } = req.body;

    let targetUserId = rawTarget;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawTarget);
    if (!isUuid && email) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const matched = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (matched) {
        targetUserId = matched.id;
      }
    }

    const updates: any = {};
    if (user_metadata) updates.user_metadata = user_metadata;
    if (password && password.trim()) updates.password = password.trim();
    if (email && email.trim()) updates.email = email.toLowerCase().trim();

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, updates);
    if (error) {
      console.error('[Admin DB] Error updating user:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, user: data.user });
  } catch (err: any) {
    console.error('[Admin DB] Unexpected error updating user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete user permanently from Supabase DB by UUID or email
app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const rawTarget = req.params.id;
    const emailParam = (req.query.email as string) || (req.body?.email as string) || '';
    console.log(`[Admin DB] Request to delete user: target=${rawTarget}, emailParam=${emailParam}`);

    let targetUserId = rawTarget;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawTarget);

    if (!isUuid || emailParam) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const matched = listData?.users?.find(
        (u) =>
          u.id === rawTarget ||
          (emailParam && u.email?.toLowerCase() === emailParam.toLowerCase()) ||
          u.email?.toLowerCase() === rawTarget.toLowerCase()
      );
      if (matched) {
        targetUserId = matched.id;
      }
    }

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId)) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (error && !error.message.toLowerCase().includes('not found')) {
        console.error('[Admin DB] Error deleting user:', error);
        return res.status(400).json({ success: false, error: error.message });
      }
    }

    console.log(`[Admin DB] Successfully removed user ${targetUserId} from Supabase DB.`);
    return res.json({ success: true, deletedId: targetUserId });
  } catch (err: any) {
    console.error('[Admin DB] Unexpected error deleting user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Dedicated Freight Quote Endpoint
app.post('/api/quote', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const recipientCompanyEmail = process.env.DISPATCH_EMAIL || process.env.OWNER_EMAIL || 'info@gallant-corp.com';
    const senderEmail = process.env.GMAIL_USER || 'dispatch@gallant-corp.com';

    console.log('--------------------------------------------------');
    console.log('📦 NEW FREIGHT QUOTE SUBMISSION:');
    console.log(`Shipper: ${data.fullName} (${data.company || 'N/A'})`);
    console.log(`Contact: ${data.email} | ${data.phone}`);
    console.log(`Route: ${data.pickup} -> ${data.destination}`);
    console.log(`Equipment: ${data.equipment}`);
    console.log(`Pickup Date: ${data.date}`);
    console.log(`Notes: ${data.notes || 'None'}`);
    console.log('--------------------------------------------------');

    const transporter = createTransporter();

    if (transporter) {
      // 1. Email to Corporate Dispatch (info@gallant-corp.com)
      await transporter.sendMail({
        from: `"Gallant Quote System" <${senderEmail}>`,
        to: recipientCompanyEmail,
        replyTo: data.email,
        subject: `[Urgent Freight Quote Request] ${data.company || data.fullName} — ${data.pickup} to ${data.destination}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="background: #0f172a; padding: 16px 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Gallant Line Haul Corp</h2>
              <p style="color: #0d9488; margin: 4px 0 0; font-size: 13px; font-weight: bold;">New Freight Quote Request Received</p>
            </div>
            
            <div style="padding: 20px 10px;">
              <h3 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #0d9488; padding-bottom: 6px;">Shipper & Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <tr><td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Client Name:</strong></td><td style="color: #0f172a;">${data.fullName}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;"><strong>Company Name:</strong></td><td style="color: #0f172a;">${data.company || 'Not Specified'}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;"><strong>Email Address:</strong></td><td style="color: #0d9488;"><strong>${data.email}</strong></td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;"><strong>Phone Number:</strong></td><td style="color: #0f172a;">${data.phone}</td></tr>
              </table>

              <h3 style="color: #0f172a; border-bottom: 2px solid #0d9488; padding-bottom: 6px;">Freight Specifications</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <tr><td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Origin Location:</strong></td><td style="color: #0f172a; font-weight: bold;">${data.pickup}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;"><strong>Destination:</strong></td><td style="color: #0f172a; font-weight: bold;">${data.destination}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;"><strong>Equipment Type:</strong></td><td style="color: #0f172a;">${data.equipment}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;"><strong>Estimated Date:</strong></td><td style="color: #0f172a;">${data.date}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; vertical-align: top;"><strong>Customs / Notes:</strong></td><td style="color: #0f172a;">${data.notes || 'None provided'}</td></tr>
              </table>

              <div style="background: #f8fafc; padding: 14px; border-left: 4px solid #0d9488; border-radius: 4px; font-size: 13px; color: #334155;">
                <strong>Action Required:</strong> Log in to the Gallant Dispatch System or reply directly to this email to issue a rate confirmation to the client.
              </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
              Gallant Line Haul Corp &bull; Canadian Bonded Carrier &bull; C-TPAT Certified
            </div>
          </div>
        `,
      });

      // 2. Automated Confirmation Email to Client
      if (data.email) {
        await transporter.sendMail({
          from: `"Gallant Line Haul Corp" <${senderEmail}>`,
          to: data.email,
          subject: `Freight Quote Request Received — Gallant Line Haul Corp`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a;">Dear ${data.fullName},</h2>
              <p style="color: #334155; line-height: 1.6;">
                Thank you for requesting a freight quote from <strong>Gallant Line Haul Corp</strong>.
              </p>
              <p style="color: #334155; line-height: 1.6;">
                Our pricing and dispatch team has received your shipping requirements from <strong>${data.pickup}</strong> to <strong>${data.destination}</strong> (${data.equipment}) for <strong>${data.date}</strong>. We are currently assessing capacity and customs routing to provide you with the most competitive rate.
              </p>
              <p style="color: #334155; line-height: 1.6;">
                A logistics specialist will reply to this email with your official rate confirmation shortly. For urgent inquiries or immediate trailer booking, please call our 24/7 dispatch desk at <strong>+1 (416) 735-5356</strong>.
              </p>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                Best regards,<br/>
                <strong>Gallant Line Haul Corp Logistics & Dispatch Team</strong><br/>
                Email: info@gallant-corp.com | Phone: +1 (416) 735-5356<br/>
                Canadian Bonded Carrier | C-TPAT & CARB Certified
              </div>
            </div>
          `,
        });
      }

      console.log(`✅ Notification emails dispatched to ${recipientCompanyEmail} and ${data.email}`);
    } else {
      console.log(`ℹ️ SMTP Transporter not initialized (GMAIL_USER / GMAIL_APP_PASSWORD pending in .env). Quote safely captured.`);
    }

    return res.status(200).json({
      success: true,
      message: `Quote registered successfully! Notifications routed to ${recipientCompanyEmail}.`,
    });
  } catch (error: any) {
    console.error('Quote Processing Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch quote emails.',
    });
  }
});

// 2. General Inquiry Email Endpoint
app.post('/api/send-email', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const recipientCompanyEmail = process.env.DISPATCH_EMAIL || process.env.OWNER_EMAIL || 'info@gallant-corp.com';
    const senderEmail = process.env.GMAIL_USER || 'dispatch@gallant-corp.com';

    console.log(`📨 General form submission from: ${data.fullName || data.name} (${data.email})`);

    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Gallant Line Haul" <${senderEmail}>`,
        to: recipientCompanyEmail,
        replyTo: data.email,
        subject: `New Inquiry: ${data.inquiryType || 'General Form'} - ${data.fullName || data.company || 'Visitor'}`,
        text: `Name: ${data.fullName}\nCompany: ${data.company || 'N/A'}\nEmail: ${data.email}\nPhone: ${data.phone}\nMessage: ${data.message}`,
      });
    }

    return res.status(200).json({ success: true, message: 'Inquiry received successfully!' });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process inquiry.' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gallant Line Haul Corp Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
