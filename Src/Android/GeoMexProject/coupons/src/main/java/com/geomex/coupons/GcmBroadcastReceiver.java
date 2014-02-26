package com.geomex.coupons;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;

/**
 * Created by adriangarcia on 05/02/14.
 */
public class GcmBroadcastReceiver extends BroadcastReceiver {

    private Context mContext;

    @Override
    public void onReceive(Context context, Intent intent) {
        mContext = context;

        if (!shouldNotifyGcmEvent()) {
            return;
        }

        Bundle extras = intent.getExtras();
        final String couponId = extras.getString("offerid");
        final String title = extras.getString("title");
        final String subtitle = extras.getString("subtitle");
        final String clientName = extras.getString("client_name");
        String clientLogo = extras.getString("client_logo");

        new ImageFetcher(clientLogo, new ImageFetcher.OnImageFetchedListener() {
            @Override
            public void onImageFetched(Bitmap bitmap) {
                if (bitmap == null) {
                    bitmap = BitmapFactory.decodeResource(
                            mContext.getResources(), R.drawable.ic_picture);
                }

                notifyGcmEvent(
                        couponId,
                        title,
                        subtitle,
                        clientName,
                        bitmap);
            }
        }).execute();
    }

    private boolean shouldNotifyGcmEvent() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(mContext);
        return preferences.getBoolean(PlaceholderFragment.USER_LOGIN_PREF, false);
    }

    private void notifyGcmEvent(
            String couponId,
            String title,
            String text,
            String info,
            Bitmap icon) {

        NotificationCompat.Builder builder = new NotificationCompat.Builder(mContext)
                .setSmallIcon(R.drawable.ic_launcher)
                .setLargeIcon(icon)
                .setContentTitle(title)
                .setContentText(text)
                .setContentInfo(info)
                .setDefaults(Notification.DEFAULT_ALL)
                .setAutoCancel(true);
        Intent resultIntent = new Intent(mContext, CouponActivity.class);
        resultIntent.putExtra(CouponActivity.COUPON_ID_KEY, couponId);
        resultIntent.putExtra(CouponActivity.COUPON_TITLE_KEY, title);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(mContext);
        stackBuilder.addParentStack(CouponActivity.class);
        stackBuilder.addNextIntent(resultIntent);

        PendingIntent resultPendingIntent = stackBuilder.getPendingIntent(
                Integer.valueOf(couponId),
                PendingIntent.FLAG_UPDATE_CURRENT);
        builder.setContentIntent(resultPendingIntent);
        NotificationManager manager =
                (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(Integer.valueOf(couponId), builder.build());
    }
}
