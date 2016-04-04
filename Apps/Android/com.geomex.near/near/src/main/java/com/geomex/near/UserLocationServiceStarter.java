package com.geomex.near;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Created by adriangarcia on 17/03/14.
 */
public class UserLocationServiceStarter extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent serviceIntent = new Intent(context, UserLocationService.class);
        serviceIntent.setAction("com.geomex.near.service.USER_LOCATION_SERVICE");

        if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
            context.startService(serviceIntent);
        } else if (intent.getAction().equals(Intent.ACTION_SHUTDOWN)) {
            context.stopService(serviceIntent);
        }
    }
}
