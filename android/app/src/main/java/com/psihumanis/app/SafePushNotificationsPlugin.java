package com.psihumanis.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;

@CapacitorPlugin(
    name = "PushNotifications",
    permissions = @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "receive")
)
public class SafePushNotificationsPlugin extends Plugin {

    private static final String TAG = "SafePush";
    private static final String PUSH_NOTIFICATIONS = "receive";
    private static final String CHANNEL_ID = "psihumanis_default";
    private static final String CHANNEL_NAME = "PsiHumanis";

    public static Bridge staticBridge = null;
    public static RemoteMessage lastMessage = null;
    private NotificationManager notificationManager;

    @Override
    public void load() {
        try {
            staticBridge = this.bridge;
            notificationManager = (NotificationManager) getActivity().getSystemService(Context.NOTIFICATION_SERVICE);
            createDefaultChannel();
            if (lastMessage != null) {
                fireNotification(lastMessage);
                lastMessage = null;
            }
        } catch (Exception e) {
            Log.e(TAG, "load() failed", e);
        }
    }

    private void createDefaultChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notificacoes do PsiHumanis");
            channel.enableVibration(true);
            channel.setShowBadge(true);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
                JSObject result = new JSObject();
                result.put("receive", "granted");
                call.resolve(result);
            } else {
                super.checkPermissions(call);
            }
        } catch (Exception e) {
            Log.e(TAG, "checkPermissions failed", e);
            JSObject result = new JSObject();
            result.put("receive", "prompt");
            call.resolve(result);
        }
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || getPermissionState(PUSH_NOTIFICATIONS) == PermissionState.GRANTED) {
                JSObject result = new JSObject();
                result.put("receive", "granted");
                call.resolve(result);
            } else {
                requestPermissionForAlias(PUSH_NOTIFICATIONS, call, "permissionsCallback");
            }
        } catch (Exception e) {
            Log.e(TAG, "requestPermissions failed", e);
            JSObject result = new JSObject();
            result.put("receive", "prompt");
            call.resolve(result);
        }
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        try {
            this.checkPermissions(call);
        } catch (Exception e) {
            Log.e(TAG, "permissionsCallback failed", e);
            JSObject result = new JSObject();
            result.put("receive", "prompt");
            call.resolve(result);
        }
    }

    @PluginMethod
    public void register(PluginCall call) {
        try {
            FirebaseMessaging.getInstance().setAutoInitEnabled(true);
            FirebaseMessaging.getInstance()
                .getToken()
                .addOnCompleteListener((task) -> {
                    if (!task.isSuccessful()) {
                        sendError(task.getException() != null ? task.getException().getLocalizedMessage() : "Token error");
                        return;
                    }
                    sendToken(task.getResult());
                });
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "register failed", e);
            sendError(e.getLocalizedMessage());
            call.resolve();
        }
    }

    @PluginMethod
    public void unregister(PluginCall call) {
        try {
            FirebaseMessaging.getInstance().setAutoInitEnabled(false);
            FirebaseMessaging.getInstance().deleteToken();
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "unregister failed", e);
            call.resolve();
        }
    }

    @PluginMethod
    public void getDeliveredNotifications(PluginCall call) {
        try {
            JSArray notifications = new JSArray();
            if (notificationManager != null) {
                android.service.notification.StatusBarNotification[] activeNotifications = notificationManager.getActiveNotifications();
                for (android.service.notification.StatusBarNotification notif : activeNotifications) {
                    JSObject jsNotif = new JSObject();
                    jsNotif.put("id", notif.getId());
                    jsNotif.put("tag", notif.getTag());
                    Notification notification = notif.getNotification();
                    if (notification != null) {
                        jsNotif.put("title", notification.extras.getCharSequence(Notification.EXTRA_TITLE));
                        jsNotif.put("body", notification.extras.getCharSequence(Notification.EXTRA_TEXT));
                        jsNotif.put("group", notification.getGroup());
                        JSObject extras = new JSObject();
                        for (String key : notification.extras.keySet()) {
                            extras.put(key, String.valueOf(notification.extras.get(key)));
                        }
                        jsNotif.put("data", extras);
                    }
                    notifications.put(jsNotif);
                }
            }
            JSObject result = new JSObject();
            result.put("notifications", notifications);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "getDeliveredNotifications failed", e);
            JSObject result = new JSObject();
            result.put("notifications", new JSArray());
            call.resolve(result);
        }
    }

    @PluginMethod
    public void removeDeliveredNotifications(PluginCall call) {
        try {
            JSArray notifications = call.getArray("notifications");
            if (notifications != null && notificationManager != null) {
                for (Object o : notifications.toList()) {
                    if (o instanceof org.json.JSONObject) {
                        JSObject notif = JSObject.fromJSONObject((org.json.JSONObject) o);
                        String tag = notif.getString("tag");
                        Integer id = notif.getInteger("id");
                        if (tag == null) {
                            notificationManager.cancel(id);
                        } else {
                            notificationManager.cancel(tag, id);
                        }
                    }
                }
            }
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "removeDeliveredNotifications failed", e);
            call.resolve();
        }
    }

    @PluginMethod
    public void removeAllDeliveredNotifications(PluginCall call) {
        try {
            if (notificationManager != null) {
                notificationManager.cancelAll();
            }
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "removeAllDeliveredNotifications failed", e);
            call.resolve();
        }
    }

    @PluginMethod
    public void createChannel(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                String id = call.getString("id", CHANNEL_ID);
                String name = call.getString("name", CHANNEL_NAME);
                int importance = call.getInt("importance", 4);
                int imp = importance >= 4 ? NotificationManager.IMPORTANCE_HIGH :
                           importance >= 3 ? NotificationManager.IMPORTANCE_DEFAULT :
                           importance >= 2 ? NotificationManager.IMPORTANCE_LOW :
                           NotificationManager.IMPORTANCE_MIN;
                NotificationChannel channel = new NotificationChannel(id, name, imp);
                String description = call.getString("description", "");
                if (description != null) channel.setDescription(description);
                notificationManager.createNotificationChannel(channel);
            }
            JSObject result = new JSObject();
            result.put("id", call.getString("id", CHANNEL_ID));
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "createChannel failed", e);
            call.resolve();
        }
    }

    @PluginMethod
    public void deleteChannel(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && notificationManager != null) {
                String id = call.getString("id", CHANNEL_ID);
                notificationManager.deleteNotificationChannel(id);
            }
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "deleteChannel failed", e);
            call.resolve();
        }
    }

    @PluginMethod
    public void listChannels(PluginCall call) {
        try {
            JSArray channels = new JSArray();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && notificationManager != null) {
                for (NotificationChannel channel : notificationManager.getNotificationChannels()) {
                    JSObject ch = new JSObject();
                    ch.put("id", channel.getId());
                    ch.put("name", channel.getName());
                    ch.put("description", channel.getDescription());
                    channels.put(ch);
                }
            }
            JSObject result = new JSObject();
            result.put("channels", channels);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "listChannels failed", e);
            JSObject result = new JSObject();
            result.put("channels", new JSArray());
            call.resolve(result);
        }
    }

    public void sendToken(String token) {
        JSObject data = new JSObject();
        data.put("value", token);
        notifyListeners("registration", data, true);
    }

    public void sendError(String error) {
        JSObject data = new JSObject();
        data.put("error", error);
        notifyListeners("registrationError", data, true);
    }

    public void fireNotification(RemoteMessage remoteMessage) {
        try {
            JSObject remoteMessageData = new JSObject();
            JSObject data = new JSObject();
            remoteMessageData.put("id", remoteMessage.getMessageId());
            for (String key : remoteMessage.getData().keySet()) {
                Object value = remoteMessage.getData().get(key);
                data.put(key, value);
            }
            remoteMessageData.put("data", data);

            RemoteMessage.Notification notification = remoteMessage.getNotification();
            if (notification != null) {
                String title = notification.getTitle();
                String body = notification.getBody();
                remoteMessageData.put("title", title);
                remoteMessageData.put("body", body);
                remoteMessageData.put("click_action", notification.getClickAction());

                if (getActivity() != null) {
                    showLocalNotification(title, body, data);
                }
            }

            notifyListeners("pushNotificationReceived", remoteMessageData, true);
        } catch (Exception e) {
            Log.e(TAG, "fireNotification failed", e);
        }
    }

    private void showLocalNotification(String title, String body, JSObject data) {
        try {
            Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder = new Notification.Builder(getActivity(), CHANNEL_ID);
            } else {
                builder = new Notification.Builder(getActivity());
            }

            builder.setSmallIcon(getContext().getApplicationInfo().icon)
                   .setContentTitle(title)
                   .setContentText(body)
                   .setAutoCancel(true)
                   .setStyle(new Notification.BigTextStyle().bigText(body));

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                builder.setPriority(Notification.PRIORITY_HIGH);
            }

            int notifId = (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
            notificationManager.notify(notifId, builder.build());
        } catch (Exception e) {
            Log.e(TAG, "showLocalNotification failed", e);
        }
    }

    public static SafePushNotificationsPlugin getInstance() {
        if (staticBridge != null && staticBridge.getWebView() != null) {
            PluginHandle handle = staticBridge.getPlugin("PushNotifications");
            if (handle == null) {
                return null;
            }
            return (SafePushNotificationsPlugin) handle.getInstance();
        }
        return null;
    }
}
