package com.geomex.near;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

/**
 * Created by adriangarcia on 18/03/14.
 */
public class PushMessagingServiceStarter extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent serviceIntent = new Intent(context, PushMessagingService.class);
        Bundle extras = intent.getExtras();

        serviceIntent.setAction("com.geomex.near.service.PUSH_MESSAGING_SERVICE");
        serviceIntent.putExtras(extras);
        context.startService(serviceIntent);
    }
}
