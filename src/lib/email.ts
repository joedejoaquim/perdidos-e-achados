import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM ?? 'Achados <noreply@achados.app>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export { APP_URL };

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY não configurada — email não enviado.');
    return;
  }
  try {
    // Instanciado de forma lazy — só quando a função é chamada em runtime
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[email] Falha ao enviar email:', err);
  }
}
