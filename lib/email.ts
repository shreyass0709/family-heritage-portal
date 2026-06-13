import nodemailer from "nodemailer";

export async function sendAdminNotification(newUserName: string, newUserEmail: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn("[Email Helper] ADMIN_EMAIL is not configured. Skipping email notification.");
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn("[Email Helper] SMTP credentials are not fully configured. Skipping email notification.");
    console.log(`[Email Notification Dummy]\nTo: ${adminEmail}\nSubject: New User Access Request\nBody: A new user has requested access:\nName: ${newUserName}\nEmail: ${newUserEmail}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"Family Heritage Portal" <${user}>`,
      to: adminEmail,
      subject: "🚨 New User Access Request - Family Heritage Portal",
      text: `A new user has requested access to the portal:\n\nName: ${newUserName}\nEmail: ${newUserEmail}\n\nPlease log in to the Administrator Panel to approve or deny their access request.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa;">
          <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px; margin-top: 0;">New Access Request</h2>
          <p>A new user has signed in with Google and is waiting for your approval to access the Family Heritage Portal:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 15px; font-weight: bold; color: #4b5563; width: 100px;">Name:</td>
              <td style="padding: 12px 15px; color: #1f2937;">${newUserName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 15px; font-weight: bold; color: #4b5563;">Email:</td>
              <td style="padding: 12px 15px; color: #1f2937;">${newUserEmail}</td>
            </tr>
          </table>
          <p style="margin-bottom: 25px;">Please visit the Admin Panel to approve or deny this request.</p>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin" style="display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #000000; font-weight: bold; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">Open Administrator Dashboard</a>
        </div>
      `,
    });

    console.log("[Email Helper] Notification sent: %s", info.messageId);
  } catch (error) {
    console.error("[Email Helper] Error sending notification email:", error);
  }
}
