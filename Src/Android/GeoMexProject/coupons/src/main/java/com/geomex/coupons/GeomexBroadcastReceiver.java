package com.geomex.coupons;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Created by adriangarcia on 22/01/14.
 */
public class GeomexBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Intent geomexServiceIntent = new Intent(context, GeomexService.class);
        String packageName = context.getPackageName();
        geomexServiceIntent.setAction(packageName + ".GEOMEX_SERVICE");

        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            context.startService(geomexServiceIntent);
        }
        else if (Intent.ACTION_SHUTDOWN.equals(intent.getAction())) {
            context.stopService(geomexServiceIntent);
        }
    }
}
