import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { logger } from "./logger"

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null

  try {
    const permission = await PushNotifications.requestPermissions()
    if (permission.receive !== "granted") {
      logger.warn("Push notification permission denied")
      return null
    }

    await PushNotifications.register()

    return await new Promise<string | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 10000)

      PushNotifications.addListener("registration", (token) => {
        clearTimeout(timeout)
        logger.info("Push registration token", { token: token.value })
        resolve(token.value)
      })

      PushNotifications.addListener("registrationError", (error) => {
        clearTimeout(timeout)
        logger.error("Push registration error", { error: String(error) })
        resolve(null)
      })
    })
  } catch (error) {
    logger.error("Push notification setup failed", { error: String(error) })
    return null
  }
}

export function setupPushNotificationListeners() {
  if (!Capacitor.isNativePlatform()) return

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    logger.info("Push notification received", { title: notification.title, body: notification.body })
  })

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const data = action.notification.data
    logger.info("Push notification tapped", { data })
    if (data?.url) {
      window.location.href = data.url
    }
  })
}
