import { logger } from "./logger"

interface FcmMessage {
  token: string
  title: string
  body: string
  url?: string
  tag?: string
}

let accessToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string | null> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountKey) return null

  try {
    const serviceAccount = JSON.parse(serviceAccountKey)
    const now = Math.floor(Date.now() / 1000)
    const expiry = now + 3600

    const header = { alg: "RS256", typ: "JWT" }
    const payload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: expiry,
    }

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
    const unsignedJwt = `${encodedHeader}.${encodedPayload}`

    const cryptoModule = await import("crypto")
    const sign = cryptoModule.createSign("RSA-SHA256")
    sign.update(unsignedJwt)
    const signature = sign.sign(serviceAccount.private_key, "base64")
    const encodedSignature = signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

    const jwt = `${unsignedJwt}.${encodedSignature}`

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })

    if (!tokenRes.ok) {
      logger.error("Failed to get Firebase access token")
      return null
    }

    const tokenData = await tokenRes.json()
    accessToken = tokenData.access_token
    tokenExpiry = Date.now() + (tokenData.expires_in - 60) * 1000
    return accessToken
  } catch (error) {
    logger.error("Error generating Firebase access token", { error: String(error) })
    return null
  }
}

export async function sendFcmPush(message: FcmMessage): Promise<boolean> {
  const projectId = process.env.FIREBASE_PROJECT_ID || "psihumanis"
  const token = await getAccessToken()
  if (!token) {
    logger.warn("Cannot send FCM push: no access token")
    return false
  }

  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: message.token,
            notification: {
              title: message.title,
              body: message.body,
            },
            data: message.url ? { url: message.url } : undefined,
            android: {
              notification: {
                channel_id: "psihumanis-reminders",
                tag: message.tag,
              },
            },
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      logger.error("FCM push failed", { status: res.status, error: JSON.stringify(err) })
      return false
    }

    logger.info("FCM push sent", { token: message.token.slice(0, 20) + "..." })
    return true
  } catch (error) {
    logger.error("FCM push error", { error: String(error) })
    return false
  }
}

export async function sendFcmPushToMultiple(
  tokens: string[],
  title: string,
  body: string,
  url?: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const token of tokens) {
    const success = await sendFcmPush({ token, title, body, url })
    if (success) sent++
    else failed++
  }

  return { sent, failed }
}
