import { sendEmail, APP_URL } from '@/lib/email';

// ---------------------------------------------------------------------------
// Helpers de layout
// ---------------------------------------------------------------------------
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:#F4400A;padding:28px 40px;text-align:center;">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">ACHADOS</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px 28px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Você recebe este email porque tem notificações activadas na sua conta Achados.<br>
              <a href="${APP_URL}/dashboard/settings?tab=notificacoes" style="color:#F4400A;text-decoration:none;">Gerir preferências</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#F4400A;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;margin-top:20px;">${text}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:#475569;line-height:1.6;">${text}</p>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Enviado ao localizador quando alguém reivindica o seu item */
export async function sendClaimReceivedEmail(opts: {
  finderEmail: string;
  finderName: string;
  ownerName: string;
  itemTitle: string;
  claimId: string;
}): Promise<void> {
  const html = layout(`
    ${h1('Nova reivindicação recebida!')}
    ${p(`Olá <strong>${opts.finderName}</strong>,`)}
    ${p(`<strong>${opts.ownerName}</strong> reivindicou o item <strong>"${opts.itemTitle}"</strong> que você registou.`)}
    ${p('Aceda ao painel para aceitar ou recusar a solicitação.')}
    ${btn('Ver solicitação', `${APP_URL}/dashboard/finder`)}
  `);
  await sendEmail(opts.finderEmail, `Nova reivindicação: ${opts.itemTitle}`, html);
}

/** Enviado ao dono quando a claim é aceite pelo localizador */
export async function sendClaimAcceptedEmail(opts: {
  ownerEmail: string;
  ownerName: string;
  finderName: string;
  itemTitle: string;
  claimId: string;
}): Promise<void> {
  const html = layout(`
    ${h1('A sua solicitação foi aceite!')}
    ${p(`Olá <strong>${opts.ownerName}</strong>,`)}
    ${p(`<strong>${opts.finderName}</strong> aceitou a sua reivindicação do item <strong>"${opts.itemTitle}"</strong>.`)}
    ${p('O processo de devolução foi iniciado. Acompanhe o estado no seu painel.')}
    ${btn('Acompanhar devolução', `${APP_URL}/dashboard`)}
  `);
  await sendEmail(opts.ownerEmail, `Solicitação aceite: ${opts.itemTitle}`, html);
}

/** Enviado ao localizador quando o pagamento é confirmado */
export async function sendPaymentReleasedEmail(opts: {
  finderEmail: string;
  finderName: string;
  itemTitle: string;
  amount: number;
}): Promise<void> {
  const formatted = opts.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const html = layout(`
    ${h1('Pagamento recebido!')}
    ${p(`Olá <strong>${opts.finderName}</strong>,`)}
    ${p(`O pagamento de <strong>${formatted}</strong> referente ao item <strong>"${opts.itemTitle}"</strong> foi confirmado.`)}
    ${p('Obrigado por devolver o item ao seu dono!')}
    ${btn('Ver histórico', `${APP_URL}/dashboard/finder`)}
  `);
  await sendEmail(opts.finderEmail, `Pagamento confirmado: ${formatted}`, html);
}

/** Enviado ao dono quando um item compatível é encontrado */
export async function sendNewMatchEmail(opts: {
  ownerEmail: string;
  ownerName: string;
  itemTitle: string;
  matchedItemId: string;
}): Promise<void> {
  const html = layout(`
    ${h1('Possível correspondência encontrada!')}
    ${p(`Olá <strong>${opts.ownerName}</strong>,`)}
    ${p(`Encontrámos um item que pode corresponder ao que você perdeu: <strong>"${opts.itemTitle}"</strong>.`)}
    ${p('Aceda ao localizador para verificar os detalhes e reivindicar se for o seu.')}
    ${btn('Ver item', `${APP_URL}/search`)}
  `);
  await sendEmail(opts.ownerEmail, `Possível correspondência: ${opts.itemTitle}`, html);
}

/** Resumo semanal de actividade */
export async function sendWeeklySummaryEmail(opts: {
  userEmail: string;
  userName: string;
  itemsRegistered: number;
  itemsDelivered: number;
  pendingClaims: number;
}): Promise<void> {
  const html = layout(`
    ${h1('O seu resumo semanal')}
    ${p(`Olá <strong>${opts.userName}</strong>, aqui está o resumo da sua actividade esta semana:`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr style="background:#f8fafc;">
        <td style="padding:12px 16px;font-size:14px;color:#64748b;">Itens registados</td>
        <td style="padding:12px 16px;font-size:18px;font-weight:900;color:#0f172a;text-align:right;">${opts.itemsRegistered}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#64748b;border-top:1px solid #e2e8f0;">Devoluções concluídas</td>
        <td style="padding:12px 16px;font-size:18px;font-weight:900;color:#10b981;text-align:right;border-top:1px solid #e2e8f0;">${opts.itemsDelivered}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:12px 16px;font-size:14px;color:#64748b;border-top:1px solid #e2e8f0;">Solicitações pendentes</td>
        <td style="padding:12px 16px;font-size:18px;font-weight:900;color:#f59e0b;text-align:right;border-top:1px solid #e2e8f0;">${opts.pendingClaims}</td>
      </tr>
    </table>
    ${btn('Ir para o painel', `${APP_URL}/dashboard`)}
  `);
  await sendEmail(opts.userEmail, 'O seu resumo semanal — Achados', html);
}
