import { Resend } from "resend"
import { sanitizeHtml } from "./security"
import { logger } from "./logger"

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

async function sendViaResend(to: string, subject: string, html: string): Promise<string | null> {
  const client = getResend()
  if (!client) return "RESEND_API_KEY não configurada"

  try {
    const { error } = await client.emails.send({
      from: process.env.EMAIL_FROM || "PsiHumanis <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    })
    if (error) {
      logger.error("Resend send error", { error })
      return `Resend: ${error.message}`
    }
    logger.debug("Email enviado via Resend", { to, subject })
    return null
  } catch (err: unknown) {
    logger.error("Resend exception", { error: String(err) })
    return String(err)
  }
}

async function sendViaSendGrid(to: string, subject: string, html: string): Promise<string | null> {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "psi_mariojunior@hotmail.com"

  if (!apiKey) return "SENDGRID_API_KEY não configurada"

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: "PsiHumanis" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      logger.error("SendGrid error", { status: res.status, body })
      return `SendGrid: ${body}`
    }
    logger.debug("Email enviado via SendGrid", { to, subject })
    return null
  } catch (err: unknown) {
    logger.error("SendGrid exception", { error: String(err) })
    return String(err)
  }
}

const PSYCHOLOGIST_EMAIL = process.env.PSYCHOLOGIST_EMAIL || "psi_mariojunior@hotmail.com"

export async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  // Resend only for the project owner
  if (to === PSYCHOLOGIST_EMAIL && process.env.RESEND_API_KEY) {
    return sendViaResend(to, subject, html)
  }
  // SendGrid for everyone else (new psychologists, patients)
  return sendViaSendGrid(to, subject, html)
}

export async function sendCancellationNotification(
  psyEmail: string,
  patientName: string,
  date: string,
  time: string,
  reason?: string | null
): Promise<string | null> {
  return sendEmail(
    psyEmail,
    "Cancelamento de Consulta - PsiHumanis",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Cancelamento de Consulta</h2>
      <p>O paciente <strong>${patientName}</strong> cancelou a consulta:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;"><strong>${date}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Horário</td><td style="padding: 8px 0;"><strong>${time}</strong></td></tr>
        ${reason ? `<tr><td style="padding: 8px 0; color: #666;">Motivo</td><td style="padding: 8px 0;"><strong>${reason}</strong></td></tr>` : ""}
      </table>
      <p style="font-size: 0.875rem; color: #666;">O horário foi liberado para novos agendamentos.</p>
    </div>`
  )
}

export async function sendWelcomeEmail(email: string, name: string): Promise<string | null> {
  const safeName = sanitizeHtml(name)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://psihumanis.com.br"
  return sendEmail(
    email,
    "Bem-vindo ao PsiHumanis! 🎉",
    `<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #0D9488; font-size: 1.75rem; margin: 0;">PsiHumanis</h1>
        <p style="color: #666; margin: 8px 0 0;">Seu sistema de gestão psicológica</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 32px;">
        <p style="font-size: 1.125rem; margin: 0 0 16px;">Olá, <strong>${safeName}</strong>! 👋</p>
        <p style="margin: 0 0 24px; line-height: 1.6;">Sua conta foi criada com sucesso. Aqui estão <strong>3 passos</strong> pra começar agora:</p>
        <div style="space-y: 12px;">
          <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
            <div style="width: 32px; height: 32px; background: #ccfbf1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">1️⃣</div>
            <div>
              <p style="margin: 0; font-weight: 600; font-size: 14px;">Configure seu perfil público</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Adicione foto, especialidades e horários de atendimento.</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
            <div style="width: 32px; height: 32px; background: #ccfbf1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">2️⃣</div>
            <div>
              <p style="margin: 0; font-weight: 600; font-size: 14px;">Cadastre seu primeiro paciente</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Comece a organizar seus atendimentos.</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
            <div style="width: 32px; height: 32px; background: #ccfbf1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">3️⃣</div>
            <div>
              <p style="margin: 0; font-weight: 600; font-size: 14px;">Agende uma consulta</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Teste o fluxo completo de atendimento.</p>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background: #0D9488; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Acessar o Dashboard</a>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 24px;">
        Precisa de ajuda? Responda este email ou fale conosco pelo WhatsApp.<br>
        <a href="https://wa.me/5531992863861" style="color: #0D9488;">(31) 99286-3861</a>
      </p>
    </div>`
  )
}

export async function sendPasswordResetEmail(email: string, token: string, path = "/paciente/reset-password"): Promise<string | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetUrl = `${appUrl}${path}?token=${token}`
  return sendEmail(
    email,
    "Recuperação de Senha - PsiHumanis",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Recuperação de Senha</h2>
      <p>Você solicitou a redefinição da sua senha no PsiHumanis.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetUrl}"
         style="display: inline-block; padding: 12px 24px; background: #0D9488; color: #fff; text-decoration: none; border-radius: 6px;">
        Redefinir Senha
      </a>
      <p style="margin-top: 24px; font-size: 0.875rem; color: #666;">
        Este link expira em 1 hora.<br>
        Se você não solicitou esta alteração, ignore este email.
      </p>
    </div>`
  )
}

export async function sendAppointmentReminderEmail(
  to: string,
  patientName: string,
  psychologistName: string,
  date: string,
  time: string,
  type: string,
  modality: string
): Promise<string | null> {
  const safePatientName = sanitizeHtml(patientName)
  const safePsychologistName = sanitizeHtml(psychologistName)
  return sendEmail(
    to,
    "Lembrete de Consulta - PsiHumanis",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0D9488; font-size: 1.5rem; margin: 0;">PsiHumanis</h1>
        <p style="color: #666; margin: 0;">Seu lembrete de consulta</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px;">
        <p style="font-size: 1.125rem; margin: 0 0 16px;">Olá, <strong>${safePatientName}</strong>!</p>
        <p style="margin: 0 0 8px;">Você tem uma consulta agendada:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;"><strong>${date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Horário</td><td style="padding: 8px 0;"><strong>${time}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tipo</td><td style="padding: 8px 0;"><strong>${type}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Modalidade</td><td style="padding: 8px 0;"><strong>${modality === "online" ? "Online" : "Presencial"}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Psicólogo(a)</td><td style="padding: 8px 0;"><strong>${safePsychologistName}</strong></td></tr>
        </table>
        ${modality === "online"
          ? '<p style="margin-top: 16px; padding: 12px; background: #e0f2fe; border-radius: 6px; font-size: 0.875rem;">A consulta ser\u00e1 online. Acesse o link da sala virtual no momento da consulta.</p>'
          : '<p style="margin-top: 16px; padding: 12px; background: #f0fdf4; border-radius: 6px; font-size: 0.875rem;">A consulta ser\u00e1 presencial. Compare\u00e7a ao endere\u00e7o do consult\u00f3rio.</p>'}
      </div>
      <p style="text-align: center; font-size: 0.75rem; color: #999; margin-top: 24px;">PsiHumanis — Gestão de Psicologia</p>
    </div>`
  )
}