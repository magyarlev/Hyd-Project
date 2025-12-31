import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Email szállító konfigurációja (Gmail, Outlook, stb.)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Log early if SMTP is unreachable/misconfigured (does not log secrets).
void transporter.verify().then(
  () => {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = process.env.EMAIL_PORT || "587";
    console.log(`SMTP transporter verified (host=${host} port=${port})`);
  },
  (err) => {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = process.env.EMAIL_PORT || "587";
    console.error(
      `SMTP transporter verify failed (host=${host} port=${port}):`,
      err
    );
  }
);

export const sendVerificationEmail = async (
  email: string,
  verificationLink: string
) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error(
        "Email is not configured (EMAIL_USER/EMAIL_PASSWORD missing)."
      );
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification - How Is Your Day",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for registering on <strong>How Is Your Day</strong>! To complete your registration, please verify your email address by clicking the link below:</p>
          
          <p style="margin: 20px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </p>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${verificationLink}
          </p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <p>If you did not create this account, please ignore this email.</p>
          
          <p>Best regards,<br>The How Is Your Day Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = process.env.EMAIL_PORT || "587";
    console.error(
      `Error sending verification email (host=${host} port=${port}):`,
      error
    );
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to How Is Your Day!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to How Is Your Day!</h2>
          <p>Hello ${userName},</p>
          <p>Your email has been successfully verified. Your account is now active!</p>
          
          <p>You can now:</p>
          <ul>
            <li>Share your stories</li>
            <li>Read stories from others</li>
            <li>Support causes with donations</li>
          </ul>
          
          <p>Get started now and share your story!</p>
          
          <p>Best regards,<br>The How Is Your Day Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};
