package com.psihumanis.app;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import android.util.Log;

public class MessagingService extends FirebaseMessagingService {

    private static final String TAG = "MessagingService";

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "FCM token refreshed");
        SafePushNotificationsPlugin plugin = SafePushNotificationsPlugin.getInstance();
        if (plugin != null) {
            plugin.sendToken(token);
        }
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "FCM message received");
        SafePushNotificationsPlugin plugin = SafePushNotificationsPlugin.getInstance();
        if (plugin != null) {
            plugin.fireNotification(remoteMessage);
        } else {
            SafePushNotificationsPlugin.lastMessage = remoteMessage;
        }
    }
}
