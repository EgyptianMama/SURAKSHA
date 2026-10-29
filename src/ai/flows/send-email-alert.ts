'use server';

/**
 * @fileOverview Sends a real email alert using Nodemailer.
 *
 * - sendEmailAlert - A function that takes a message and email address and sends an email.
 * - SendEmailAlertInput - The input type for the sendEmailAlert function.
 * - SendEmailAlertOutput - The return type for the sendEmailAlert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendEmailAlertInputSchema = z.object({
  message: z.string().describe('The content of the email alert.'),
  email: z.string().email().describe('The destination email address.'),
});
export type SendEmailAlertInput = z.infer<typeof SendEmailAlertInputSchema>;

const SendEmailAlertOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  confirmationMessage: z.string().describe('A message confirming the action.'),
});
export type SendEmailAlertOutput = z.infer<typeof SendEmailAlertOutputSchema>;

export async function sendEmailAlert(
  input: SendEmailAlertInput
): Promise<SendEmailAlertOutput> {
  return sendEmailAlertFlow(input);
}

const sendEmailAlertFlow = ai.defineFlow(
  {
    name: 'sendEmailAlertFlow',
    inputSchema: SendEmailAlertInputSchema,
    outputSchema: SendEmailAlertOutputSchema,
  },
  async ({ email, message }) => {
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS environment variables not set. Cannot send email.");
      return {
        success: false,
        confirmationMessage: "Email service is not configured on the server.",
      };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"SURAKSHA Alert" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'EMERGENCY ALERT',
        text: message,
        html: `
            <div style="font-family: sans-serif; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; max-width: 600px;">
                <h1 style="color: #dc2626; border-bottom: 1px solid #fca5a5; padding-bottom: 10px;">🚨 Emergency Alert</h1>
                <p style="font-size: 16px; line-height: 1.5;">${message}</p>
                <hr style="border: none; border-top: 1px solid #fca5a5; margin: 20px 0;" />
                <p style="font-size: 12px; color: #7f1d1d;">This is an automated notification from the SURAKSHA application.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        return {
            success: true,
            confirmationMessage: `An email alert has been successfully sent to ${email}.`,
        };
    } catch (error) {
        console.error("Failed to send email:", error);
        return {
            success: false,
            confirmationMessage: `Failed to send email alert. Check server logs for details.`,
        };
    }
  }
);
