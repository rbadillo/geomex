package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.preference.PreferenceManager;
import android.support.v7.app.ActionBar;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;

import com.facebook.Session;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.qualcommlabs.usercontext.Callback;
import com.qualcommlabs.usercontext.ContextCoreConnector;
import com.qualcommlabs.usercontext.ContextCoreConnectorFactory;

import java.io.IOException;

public class MainActivity extends ActionBarActivity {

    public static final String REGISTRATION_ID_PREF = "registration_id";

    private final static int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

    /**
     * Substitute you own sender ID here. This is the project number you got
     * from the API Console, as described in "Getting Started."
     */
    private final String SENDER_ID = "820123048362";
    private String mRegId;
    private LocationClientManager mLocationManager;
    private ContextCoreConnector mContextCoreConnector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ActionBar actionBar = getSupportActionBar();
        actionBar.setDisplayHomeAsUpEnabled(true);
        actionBar.setHomeButtonEnabled(true);
        actionBar.hide();

        mLocationManager = new LocationClientManager(this);
        mContextCoreConnector = ContextCoreConnectorFactory.get(this);

        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.container, new PlaceholderFragment())
                    .commit();
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (checkPlayServices()) {
            mRegId = getRegistrationId();

            if (mRegId.length() == 0) {
                registerInBackground();
            }

            mLocationManager.connect();
        }

        if (!mContextCoreConnector.isPermissionEnabled()) {
            enableContextConnector();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        mContextCoreConnector.setCurrentActivity(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        mContextCoreConnector.setCurrentActivity(null);
    }

    @Override
    protected void onStop() {
        super.onStop();
        mLocationManager.disconnect();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.activity_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_logout) {
            Session session = Session.getActiveSession();
            session.closeAndClearTokenInformation();
            return true;
        }
        if (id == R.id.action_settings) {
            Intent intent = new Intent(this, SettingsActivity.class);
            startActivity(intent);
            return true;
        }
        if (id == R.id.action_gimbal) {
            mContextCoreConnector.showUpdatePermissionsUI(this, new Callback<Void>() {
                @Override
                public void success(Void responseObject) {

                }

                @Override
                public void failure(int statusCode, String errorMessage) {

                }
            });
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private boolean checkPlayServices() {
        int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
                GooglePlayServicesUtil.getErrorDialog(
                        resultCode,
                        this,
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            }
            return false;
        }
        return true;
    }

    private String getRegistrationId() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        return preferences.getString(REGISTRATION_ID_PREF, "");
    }

    private void registerInBackground() {
        new RegisterInBackground(this).execute();
    }

    private void enableContextConnector() {
        mContextCoreConnector.enable(this, new Callback<Void>() {
            @Override
            public void success(Void aVoid) {

            }

            @Override
            public void failure(int i, String s) {
                finish();
            }
        });
    }

    private class RegisterInBackground extends AsyncTask<Void, Void, String> {

        private Context mContext;

        public RegisterInBackground(Context ctx) {
            super();
            mContext = ctx;
        }

        @Override
        protected String doInBackground(Void... params) {
            try {
                GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(mContext);
                mRegId = gcm.register(SENDER_ID);
                storeRegistrationId(mRegId);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
            return null;
        }

        private void storeRegistrationId(String regId) {
            SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(mContext);
            SharedPreferences.Editor editor = preferences.edit();
            editor.putString(REGISTRATION_ID_PREF, regId);
            editor.commit();
        }
    }
}
