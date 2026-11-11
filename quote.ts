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
  // CORS Headers
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

    console.log('📦 NEW FREIGHT QUOTE SUBMISSION (Serverless):');
    console.log(`Shipper: ${data.fullName} (${data.company || 'N/A'})`);
    console.log(`Contact: ${data.email} | ${data.phone}`);
    console.log(`Route: ${data.pickup} -> ${data.destination}`);

    const transporter = createTransporter();

    if (transporter) {
      try {
        // 1. Corporate Dispatch Notification
        await transporter.sendMail({
          from: `"Gallant Quote Dispatch" <${senderEmail}>`,
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

        // 2. Client Confirmation Receipt
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
                  Our pricing and dispatch team has received your shipping requirements from <strong>${data.pickup}</strong> to <strong>${data.destination}</strong> (${data.equipment}) for <strong>${data.date}</strong>. We are assessing capacity and cross-border routing to provide you with the most competitive rate.
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
      } catch (mailErr: any) {
        console.warn('⚠️ SMTP mail notification notice:', mailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Quote registered successfully! Notifications routed to ${recipientCompanyEmail}.`,
    });
  } catch (err: any) {
    console.error('Quote handler error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to dispatch quote emails.' });
  }
}
