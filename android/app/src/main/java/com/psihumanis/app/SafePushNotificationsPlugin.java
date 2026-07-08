package com.psihumanis.app;

import android.Manifest;
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

@CapacitorPlugin(
    name = "PushNotifications",
    permissions = @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "receive")
)
public class SafePushNotificationsPlugin extends Plugin {

    private static final String TAG = "SafePush";
    private static final String PUSH_NOTIFICATIONS = "receive";

    public static Bridge staticBridge = null;
    public static com.google.firebase.messaging.RemoteMessage lastMessage = null;

    @Override
    public void load() {
        try {
            staticBridge = this.bridge;
            if (lastMessage != null) {
                fireNotification(lastMessage);
                lastMessage = null;
            }
        } catch (Exception e) {
            Log.e(TAG, "load() failed", e);
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

    public void fireNotification(com.google.firebase.messaging.RemoteMessage remoteMessage) {
        try {
            JSObject remoteMessageData = new JSObject();
            JSObject data = new JSObject();
            remoteMessageData.put("id", remoteMessage.getMessageId());
            for (String key : remoteMessage.getData().keySet()) {
                Object value = remoteMessage.getData().get(key);
                data.put(key, value);
            }
            remoteMessageData.put("data", data);

            com.google.firebase.messaging.RemoteMessage.Notification notification = remoteMessage.getNotification();
            if (notification != null) {
                remoteMessageData.put("title", notification.getTitle());
                remoteMessageData.put("body", notification.getBody());
                remoteMessageData.put("click_action", notification.getClickAction());
            }

            notifyListeners("pushNotificationReceived", remoteMessageData, true);
        } catch (Exception e) {
            Log.e(TAG, "fireNotification failed", e);
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
