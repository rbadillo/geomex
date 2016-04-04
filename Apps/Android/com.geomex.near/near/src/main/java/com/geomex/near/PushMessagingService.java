package com.geomex.near;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;

/**
 * Created by adriangarcia on 18/03/14.
 */
public class PushMessagingService extends Service {

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Bundle extras = intent.getExtras();
        String clientName = extras.getString("client_name");
        String clientLogo = extras.getString("client_logo");
        String offerId = extras.getString("offer_id");
        String messageTitle = extras.getString("message_title");
        String messageSubtitle = extras.getString("message_subtitle");

        boolean gcmNotifEnabled = Preferences.getGcmNotificationsEnabled(this);

        if (gcmNotifEnabled) {
            notifyPushMessage(clientName, clientLogo, offerId, messageTitle, messageSubtitle);
        }

        return Service.START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void notifyPushMessage(final String clientName,
                                   final String clientLogo,
                                   final String offerId,
                                   final String messageTitle,
                                   final String messageSubtitle) {

        final Context context = this;
        RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
            @Override
            public void onRemoteImageFetched(Bitmap image) {
                if (image == null) {
                    image = BitmapFactory.decodeResource(context.getResources(),
                            R.drawable.ic_picture);
                };

                Intent resultIntent = new Intent(context, MainActivity.class);
                resultIntent.putExtra(MainActivity.EXTRA_CURRENT_FRAGMENT, MainActivity.FRAGMENT_INBOX);

                TaskStackBuilder stackBuilder = TaskStackBuilder.create(context);
                stackBuilder.addNextIntent(resultIntent);

                PendingIntent pendingIntent = stackBuilder.getPendingIntent(
                        Integer.valueOf(offerId), PendingIntent.FLAG_UPDATE_CURRENT);

                NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                        .setContentTitle(messageTitle)
                        .setContentText(messageSubtitle)
                        .setContentInfo(clientName)
                        .setSmallIcon(R.drawable.ic_stat_near)
                        .setLargeIcon(image)
                        .setDefaults(Notification.DEFAULT_ALL)
                        .setAutoCancel(true);
                builder.setContentIntent(pendingIntent);

                NotificationManager manager = (NotificationManager)
                        context.getSystemService(Context.NOTIFICATION_SERVICE);
                manager.notify(Integer.valueOf(offerId), builder.build());

                stopSelf();
            }
        };
        RemoteImageFetcher remoteImageFetcher = new RemoteImageFetcher(clientLogo);
        remoteImageFetcher.setCallbacks(callbacks);
        remoteImageFetcher.execute();
    }

}
