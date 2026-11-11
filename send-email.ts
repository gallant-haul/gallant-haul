import nodemailer from 'nodemailer';

function createTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: user.replace(/\s+/g, ''), pass: pass.replace(/\s+/g, '') },
    });
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: (process.env.SMTP_USER || '').replace(/\s+/g, ''),
        pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
      },
    });
  }

  return null;
}

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
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const recipientCompanyEmail = process.env.DISPATCH_EMAIL || process.env.OWNER_EMAIL || 'info@gallant-corp.com';
    const senderEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'dispatch@gallant-corp.com';

    console.log(`📨 Inquiry from: ${data.fullName || data.name} (${data.email})`);

    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Gallant Line Haul" <${senderEmail}>`,
        to: recipientCompanyEmail,
        replyTo: data.email,
        subject: `New Inquiry: ${data.inquiryType || 'General Form'} - ${data.fullName || data.company || 'Visitor'}`,
        text: `Name: ${data.fullName || data.name}\nCompany: ${data.company || 'N/A'}\nEmail: ${data.email}\nPhone: ${data.phone}\nMessage: ${data.message}`,
      });
    }

    return res.status(200).json({ success: true, message: 'Inquiry received successfully!' });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to process inquiry.' });
  }
}
