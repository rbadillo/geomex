package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.net.Uri;
import android.os.AsyncTask;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;

import com.apptentive.android.application.ApplicationSessionActivity;
import com.facebook.Request;
import com.facebook.Response;
import com.facebook.Session;
import com.facebook.model.GraphUser;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.location.LocationClient;
import com.qualcommlabs.usercontext.Callback;
import com.qualcommlabs.usercontext.ContextCoreConnector;
import com.qualcommlabs.usercontext.ContextCoreConnectorFactory;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.protocol.HTTP;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

/**
 * Created by adriangarcia on 01/03/14.
 */
public class MainActivity extends ApplicationSessionActivity {

    public static final String EXTRA_CURRENT_FRAGMENT = "current_fragment";
    public static final int FRAGMENT_CLIENTS = 0;
    public static final int FRAGMENT_INBOX = 1;
    // public static final int FRAGMENT_FRIENDS = 2;
    // public static final int FRAGMENT_MAPS = 3;

    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;
    private static final String GCM_SENDER_ID = "475475331189";

    private Menu menu;
    private ContextCoreConnector contextCoreConnector;
    private LocationClient locationClient;

    private boolean isVisible;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        final Context context = this;
        setOnSessionStartedListener(new SessionStartedListener() {
            @Override
            public void onSessionStarted() {
                new AppEventSender(context, AppEventSender.EVENT_APP_OPEN).execute();
            }
        });
        setOnSessionStoppedListener(new SessionStoppedListener() {
            @Override
            public void onSessionStopped() {
                new AppEventSender(context, AppEventSender.EVENT_APP_CLOSE).execute();
            }
        });

        contextCoreConnector = ContextCoreConnectorFactory.get(this);
        locationClient = null;

        UserLoginFragment.Callbacks callbacks = new UserLoginFragment.Callbacks() {
            @Override
            public void onSessionIsOpened() {
                if (!isVisible) return;

                enableGimbalNotifications();
                enableCoreConnector();
                enableGcmNotifications();
                enableGCloudMessaging();

                updateUserLocation();
                updateUserTimeZone();
                updateUserProfile();
                updateUserFriends();
            }

            @Override
            public void onSessionIsClosed() {
                if (!isVisible) return;

                presentUserLoginFragment();
            }
        };

        FragmentManager fm = getSupportFragmentManager();
        UserLoginFragment loginFragment = (UserLoginFragment) fm.findFragmentById(R.id.user_login_fragment);
        loginFragment.setCallbacks(callbacks);

        Intent intent = getIntent();
        Bundle extras = intent.getExtras();

        if (extras != null) {
            int fragment = extras.getInt(EXTRA_CURRENT_FRAGMENT, -1);

            if (fragment >= 0) {
                DrawerFragment drawerFragment = (DrawerFragment) fm.findFragmentById(R.id.drawer_fragment);
                drawerFragment.setCurrentFragment(fragment);
                intent.removeExtra(EXTRA_CURRENT_FRAGMENT);
            }
        } else if (savedInstanceState == null && Preferences.getUserFacebookId(this) != null) {
            presentDrawerFragment();
            DrawerFragment drawerFragment = (DrawerFragment) fm.findFragmentById(R.id.drawer_fragment);
            drawerFragment.setCurrentFragment(FRAGMENT_CLIENTS);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        contextCoreConnector.setCurrentActivity(this);
        isVisible = true;
    }

    @Override
    protected void onResumeFragments() {
        super.onResumeFragments();

        Session session = Session.getActiveSession();
        if (session != null && session.isOpened()) {
            presentDrawerFragment();
        } else {
            presentUserLoginFragment();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();

        contextCoreConnector.setCurrentActivity(null);
        isVisible = false;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        this.menu = menu;
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        if (id == R.id.action_contact) {
            Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.fromParts("mailto", "contacto@descubrenear.com", null));
            startActivity(Intent.createChooser(intent, ""));
            return true;
        }
        if (id == R.id.action_logout) {
            logoutFromFacebook();
            stopGimbalService();
            disableGimbalNotifications();
            disableGcmNotifications();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_MENU:
                if (menu != null && getSupportActionBar().isShowing()) {
                    menu.performIdentifierAction(R.id.action_overflow, 0);
                }
                return true;
        }
        return super.onKeyUp(keyCode, event);
    }

    private void presentUserLoginFragment() {
        FragmentManager fm = getSupportFragmentManager();
        Fragment login = fm.findFragmentById(R.id.user_login_fragment);
        Fragment drawer = fm.findFragmentById(R.id.drawer_fragment);

        fm.beginTransaction()
                .show(login)
                .hide(drawer)
                .commit();

        getSupportActionBar().hide();
        supportInvalidateOptionsMenu();
    }

    private void presentDrawerFragment() {
        FragmentManager fm = getSupportFragmentManager();
        Fragment login = fm.findFragmentById(R.id.user_login_fragment);
        Fragment drawer = fm.findFragmentById(R.id.drawer_fragment);

        fm.beginTransaction()
                .hide(login)
                .show(drawer)
                .commit();

        getSupportActionBar().show();
        supportInvalidateOptionsMenu();
    }

    private void enableGCloudMessaging() {
        if (checkPlayServices()) {
            String regid = Preferences.getGcmRegistrationId(this);

            if (regid == null) {
                GcmRegistrationIdSender gcmRegistrationIdSender =
                        new GcmRegistrationIdSender(this, GCM_SENDER_ID);
                gcmRegistrationIdSender.execute();
            }
        }
    }

    private boolean checkPlayServices() {
        int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
                GooglePlayServicesUtil.getErrorDialog(resultCode, this,
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            }
            return false;
        }
        return true;
    }

    private void enableCoreConnector() {
        if (contextCoreConnector.isPermissionEnabled()) {
            startGimbalService();
        } else {
            Callback<Void> callback = new Callback<Void>() {
                @Override
                public void success(Void aVoid) {
                    startGimbalService();
                }

                @Override
                public void failure(int i, String s) {

                }
            };
            contextCoreConnector.enable(this, callback);
        }
    }

    private void startGimbalService() {
        Intent serviceIntent = new Intent(this, UserLocationService.class);
        serviceIntent.setAction("com.geomex.near.service.USER_LOCATION_SERVICE");
        startService(serviceIntent);
    }

    private void stopGimbalService() {
        Intent serviceIntent = new Intent(this, UserLocationService.class);
        serviceIntent.setAction("com.geomex.near.service.USER_LOCATION_SERVICE");
        stopService(serviceIntent);
    }

    private void enableGimbalNotifications() {
        Preferences.setGimbalNotificationsEnabled(this, true);
    }

    private void disableGimbalNotifications() {
        Preferences.setGimbalNotificationsEnabled(this, false);
    }

    private void enableGcmNotifications() {
        Preferences.setGcmNotificationsEnabled(this, true);
    }

    private void disableGcmNotifications() {
        Preferences.setGcmNotificationsEnabled(this, false);
    }

    private void logoutFromFacebook() {
        Session session = Session.getActiveSession();
        if (session != null && session.isOpened()) {
            session.closeAndClearTokenInformation();
            presentUserLoginFragment();
        }
    }

    private void updateUserProfile() {
        Session session = Session.getActiveSession();
        final Context context = this;

        Request.GraphUserCallback callback = new Request.GraphUserCallback() {
            @Override
            public void onCompleted(GraphUser user, Response response) {
                if (user != null) {
                    JSONObject json = user.getInnerJSONObject();
                    Preferences.setUserFacebookId(context, user.getId());
                    Preferences.setUserFacebookProfile(context, json.toString());

                    UserRegistrationSender userRegistrationSender = new UserRegistrationSender(context);
                    userRegistrationSender.execute();
                }

                presentDrawerFragment();
                FragmentManager fm = getSupportFragmentManager();
                DrawerFragment drawerFragment = (DrawerFragment) fm.findFragmentById(R.id.drawer_fragment);
                drawerFragment.setCurrentFragment(FRAGMENT_CLIENTS);
            }
        };
        Request.newMeRequest(session, callback).executeAsync();
    }

    private void updateUserFriends() {
        Session session = Session.getActiveSession();
        final Context context = this;
        Bundle params = new Bundle();
        params.putString("fields", "id");

        Request.GraphUserListCallback callback = new Request.GraphUserListCallback() {
            @Override
            public void onCompleted(List<GraphUser> users, Response response) {
                if (users == null) return;
                String friends = "";

                for (int i = 0; i < users.size(); i++) {
                    GraphUser user = users.get(i);

                    if (i == users.size() - 1) {
                        friends += user.getId();
                        break;
                    }
                    friends += user.getId() + ", ";
                }
                Preferences.setUserFacebookFriends(context, friends);
            }
        };
        Request friendsRequest = Request.newMyFriendsRequest(session, callback);
        friendsRequest.setParameters(params);
        friendsRequest.executeAsync();
    }

    private void updateUserTimeZone() {
        TimeZone timeZone = TimeZone.getDefault();
        long timeOffset = timeZone.getRawOffset()/1000/60/60;
        Date now = Calendar.getInstance().getTime();
        boolean inDaylightTime = timeZone.inDaylightTime(now);
        String timeZoneStr = "";

        if (inDaylightTime) {
            timeOffset++;
        }
        if (timeOffset < 0) {
            timeZoneStr = String.format("%03d00", timeOffset);
        } else {
            timeZoneStr = String.format("+%02d00", timeOffset);
        }

        Preferences.setUserTimeZone(this, timeZoneStr);
    }

    private void updateUserLocation() {
        final Context context = this;
        GooglePlayServicesClient.ConnectionCallbacks callbacks = new GooglePlayServicesClient.ConnectionCallbacks() {
            @Override
            public void onConnected(Bundle bundle) {
                Location location = locationClient.getLastLocation();

                if (location != null) {
                    Preferences.setUserLocationLatitude(context, location.getLatitude());
                    Preferences.setUserLocationLongitude(context, location.getLongitude());
                }

                locationClient.disconnect();
            }

            @Override
            public void onDisconnected() {

            }
        };
        GooglePlayServicesClient.OnConnectionFailedListener listener = new GooglePlayServicesClient.OnConnectionFailedListener() {
            @Override
            public void onConnectionFailed(ConnectionResult connectionResult) {

            }
        };
        locationClient = new LocationClient(this, callbacks, listener);
        locationClient.connect();
    }

    private static class GcmRegistrationIdSender extends AsyncTask<Void, Void, String> {
        private Context context;
        private String senderId;

        public GcmRegistrationIdSender(Context context, String senderId) {
            super();
            this.context = context;
            this.senderId = senderId;
        }

        @Override
        protected String doInBackground(Void... params) {
            GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(context);
            try {
                String regid = gcm.register(senderId);
                return regid;
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);

            if (s != null) {
                Preferences.setGcmRegistrationId(context, s);
            }
        }
    }

    private static class UserRegistrationSender extends AsyncTask<Void, Void, Void> {
        private Context context;

        public UserRegistrationSender(Context context) {
            super();
            this.context = context;
        }

        @Override
        protected Void doInBackground(Void... params) {
            String userId = Preferences.getUserFacebookId(context);
            HttpClient client = new DefaultHttpClient();
            HttpPost post = new HttpPost("http://api.descubrenear.com/" + userId + "/Register");
            String userProfile = Preferences.getUserFacebookProfile(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            String gcmRegId = Preferences.getGcmRegistrationId(context);
            double latitude = Preferences.getUserLocationLatitude(context);
            double longitude = Preferences.getUserLocationLongitude(context);
            String phoneType = "Android";
            String event = "Register";

            try {
                JSONObject json = new JSONObject(userProfile);
                json.put("timezone", userTimeZone);
                json.put("device_token", gcmRegId);
                json.put("latitude", latitude);
                json.put("longitude", longitude);
                json.put("phone_type", phoneType);
                json.put("event", event);

                String body = json.toString();
                StringEntity entity = new StringEntity(body, HTTP.UTF_8);
                entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
                post.setHeader(new BasicHeader("Content-Type", "application/json"));
                post.setEntity(entity);
                client.execute(post);
            } catch (JSONException e) {
                e.printStackTrace();
            } catch (ClientProtocolException e) {
                e.printStackTrace();
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

}
