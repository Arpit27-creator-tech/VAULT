// ============================================================
// V.A.U.L.T — Email Verification Service
// Dual Engine: HTTPS REST API (Resend / Brevo) + SMTP Fallback
// Guaranteed delivery on Render Free, Vercel Serverless & Localhost
// ============================================================

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path env loading for both root and server execution
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let cachedTransporter = null;

/**
 * Configure or return singleton pooled Nodemailer transport.
 */
const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 14,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  return null;
};

/**
 * Send email via Resend HTTPS REST API (Port 443 — never blocked on Render/Vercel)
 */
async function sendViaResend({ to, subject, html, text, from }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const sender = from || process.env.RESEND_FROM || 'V.A.U.L.T HQ <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[EMAIL:Resend] API error response:', data);
      return { success: false, error: data.message || 'Resend API failed' };
    }

    console.log(`[EMAIL:Resend] Dispatched successfully to ${to} (ID: ${data.id})`);
    return { success: true, provider: 'resend', id: data.id };
  } catch (err) {
    console.error('[EMAIL:Resend] Network dispatch error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send email via Brevo HTTPS REST API (Port 443 — never blocked on Render/Vercel)
 */
async function sendViaBrevo({ to, subject, html, text, fromName, fromEmail }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const name = fromName || 'V.A.U.L.T HQ';
  const email = fromEmail || process.env.SMTP_USER || 'vault.game.hq@gmail.com';

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name, email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[EMAIL:Brevo] API error response:', data);
      return { success: false, error: data.message || 'Brevo API failed' };
    }

    console.log(`[EMAIL:Brevo] Dispatched successfully to ${to} (MessageId: ${data.messageId})`);
    return { success: true, provider: 'brevo', messageId: data.messageId };
  } catch (err) {
    console.error('[EMAIL:Brevo] Network dispatch error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send email via SMTP (Nodemailer)
 */
async function sendViaSMTP({ to, subject, html, text, from, replyTo }) {
  const transporter = getTransporter();
  if (!transporter) return null;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      text,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'Auto-Submitted': 'auto-generated',
        'X-Mailer': 'VAULT-AuthService/1.0',
      }
    });

    console.log(`[EMAIL:SMTP] Dispatched successfully to ${to} (MessageId: ${info.messageId})`);
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL:SMTP] Dispatch failed for ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Unified email dispatch prioritizing HTTPS REST APIs over SMTP
 */
async function dispatchEmail({ to, subject, html, text }) {
  const senderEmail = process.env.SMTP_USER || 'vault.game.hq@gmail.com';
  const senderFrom = process.env.SMTP_FROM || `"V.A.U.L.T HQ" <${senderEmail}>`;

  // 1. Try Resend API (HTTP REST)
  if (process.env.RESEND_API_KEY) {
    const resendResult = await sendViaResend({ to, subject, html, text });
    if (resendResult && resendResult.success) return resendResult;
  }

  // 2. Try Brevo API (HTTP REST)
  if (process.env.BREVO_API_KEY) {
    const brevoResult = await sendViaBrevo({ to, subject, html, text, fromName: 'V.A.U.L.T HQ', fromEmail: senderEmail });
    if (brevoResult && brevoResult.success) return brevoResult;
  }

  // 3. Try Nodemailer SMTP (Port 465/587)
  const smtpResult = await sendViaSMTP({
    to,
    subject,
    html,
    text,
    from: senderFrom,
    replyTo: senderEmail
  });

  if (smtpResult && smtpResult.success) {
    return smtpResult;
  }

  return { success: false, error: 'No working email transport or API key available' };
}

/**
 * Generate a random 6-digit numeric verification code
 * @returns {string} 6-digit code (e.g., "749201")
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send an email verification code with inbox-optimized HTML and plain-text fallback.
 * @param {string} toEmail - Recipient email address
 * @param {string} code - 6-digit OTP
 * @returns {Promise<{ success: boolean, previewCode: string }>}
 */
export const sendVerificationEmail = async (toEmail, code) => {
  const plainText = `Welcome to VAULT!

Your 6-digit verification code is: ${code}

Please enter this clearance code to verify your account and activate your hero operative profile.
This code expires in 10 minutes and can only be used once.

If you did not request this code, you can safely ignore this email.

— The VAULT Team`;

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your VAULT Verification Code</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #1e293b; margin: 0; padding: 24px;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px;">🌲</span>
        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">V.A.U.L.T Clearance</h1>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Virtual Academic Underground Learning Team</p>
      </div>

      <p style="font-size: 15px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
        Hello Operative,<br><br>
        Use the single-use 6-digit clearance code below to verify your email address and activate your co-op heist profile:
      </p>

      <div style="background-color: #f8fafc; border: 2px dashed #10b981; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
        <span style="font-family: Courier, 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #059669; display: block;">
          ${code}
        </span>
        <span style="font-size: 12px; color: #64748b; margin-top: 6px; display: block;">Expires in 10 minutes</span>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        If you didn't create an account on VAULT, you can safely disregard this message.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
        V.A.U.L.T • Role-Based STEM Learning Platform<br>
        This is an automated system notification.
      </p>
    </div>
  </body>
  </html>
  `;

  // Log in terminal immediately for developer/admin verification
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`📧 [EMAIL VERIFICATION CODE FOR ${toEmail}]`);
  console.log(`🔑 6-DIGIT CODE: ${code}`);
  console.log(`⏱️  EXPIRES IN: 10 minutes`);
  console.log(`══════════════════════════════════════════════════\n`);

  await dispatchEmail({
    to: toEmail,
    subject: `Your VAULT verification code: ${code}`,
    html: htmlContent,
    text: plainText
  });

  return { success: true, previewCode: code };
};

/**
 * Send a password reset email with clearance code and direct reset link.
 * @param {string} toEmail - Recipient email
 * @param {string} code - 6-digit OTP
 * @param {string} resetUrl - Direct reset URL
 */
export const sendPasswordResetEmail = async (toEmail, code, resetUrl) => {
  const plainText = `Password Reset Request — V.A.U.L.T

Your 6-digit password reset code is: ${code}

Or reset your password directly by visiting:
${resetUrl}

This code and link expire in 15 minutes.
If you did not request a password reset, please secure your account immediately.

— The VAULT Security Team`;

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your VAULT Password</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #051811; color: #f0fdf4; margin: 0; padding: 24px;">
    <div style="max-width: 500px; margin: 0 auto; background: #071e14; border: 2px solid #10b981; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px;">🔐</span>
        <h1 style="font-size: 22px; font-weight: 800; color: #f0fdf4; margin: 8px 0 4px 0;">Password Reset Request</h1>
        <p style="font-size: 13px; color: #a7f3d0; margin: 0;">V.A.U.L.T Security Clearance Override</p>
      </div>

      <p style="font-size: 15px; line-height: 1.5; color: #d1fae5; margin-bottom: 20px;">
        We received a request to reset the password for your operative account. Enter the 6-digit security code below or click the reset link to choose a new password:
      </p>

      <div style="background-color: #020c07; border: 2px dashed #fbbf24; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
        <span style="font-family: Courier, 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fbbf24; display: block;">
          ${code}
        </span>
        <span style="font-size: 12px; color: #94a3b8; margin-top: 6px; display: block;">Expires in 15 minutes</span>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #10b981; color: #02140d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
          Reset Password Now →
        </a>
      </div>

      <p style="font-size: 12px; color: #6ee7b7; line-height: 1.5;">
        If you didn't request a password reset, you can safely ignore this email. Your current password remains secure.
      </p>

      <hr style="border: none; border-top: 1px solid #063121; margin: 24px 0;">

      <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
        V.A.U.L.T • Virtual Academic Underground Learning Team
      </p>
    </div>
  </body>
  </html>
  `;

  console.log(`\n🔑 [PASSWORD RESET CODE FOR ${toEmail}]: ${code}\n🔗 URL: ${resetUrl}\n`);

  await dispatchEmail({
    to: toEmail,
    subject: `[V.A.U.L.T] Password Reset Code: ${code}`,
    html: htmlContent,
    text: plainText
  });

  return { success: true };
};
