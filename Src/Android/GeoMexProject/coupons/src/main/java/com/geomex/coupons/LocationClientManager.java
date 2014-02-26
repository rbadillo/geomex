package com.geomex.coupons;

import android.content.Context;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.Bundle;
import android.preference.PreferenceManager;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.location.LocationClient;

/**
 * Created by adriangarcia on 17/02/14.
 */
public class LocationClientManager implements GooglePlayServicesClient.ConnectionCallbacks,
        GooglePlayServicesClient.OnConnectionFailedListener {

    public static final String LAST_LOCATION_LATITUDE_PREF = "last_location_latitude";
    public static final String LAST_LOCATION_LONGITUDE_PREF = "last_location_longitude";

    private Context mContext;
    private LocationClient mLocationClient;

    public LocationClientManager(Context context) {
        mContext = context;
        mLocationClient = new LocationClient(context, this, this);
    }

    @Override
    public void onConnected(Bundle bundle) {
        storeLastLocation();
    }

    @Override
    public void onDisconnected() {

    }

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {

    }

    public void connect() {
        mLocationClient.connect();
    }

    public void disconnect() {
        mLocationClient.disconnect();
    }

    private void storeLastLocation() {
        Location location = mLocationClient.getLastLocation();
        double lat = location.getLatitude();
        double lon = location.getLongitude();

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(mContext);
        SharedPreferences.Editor editor = preferences.edit();
        editor.putLong(LAST_LOCATION_LATITUDE_PREF, Double.doubleToRawLongBits(lat));
        editor.putLong(LAST_LOCATION_LONGITUDE_PREF, Double.doubleToRawLongBits(lon));
        editor.commit();
    }
}
