package com.geomex.coupons;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.IBinder;
import android.preference.PreferenceManager;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;

import com.google.android.gms.common.ConnectionResult;
import com.qualcommlabs.usercontext.ContentListener;
import com.qualcommlabs.usercontext.ContextCoreConnector;
import com.qualcommlabs.usercontext.ContextCoreConnectorFactory;
import com.qualcommlabs.usercontext.ContextPlaceConnector;
import com.qualcommlabs.usercontext.ContextPlaceConnectorFactory;
import com.qualcommlabs.usercontext.PlaceEventListener;
import com.qualcommlabs.usercontext.protocol.ContentDescriptor;
import com.qualcommlabs.usercontext.protocol.ContentEvent;
import com.qualcommlabs.usercontext.protocol.PlaceEvent;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Created by adriangarcia on 22/01/14.
 */
public class GeomexService extends Service implements PlaceEventListener, ContentListener {

    public static final String USER_DATA_FILE = "userData";

    private ContextCoreConnector mContextCoreConnector;
    private ContextPlaceConnector mContextPlaceConnector;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        return START_STICKY;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mContextCoreConnector = ContextCoreConnectorFactory.get(this);
        mContextCoreConnector.addContentListener(this);

        mContextPlaceConnector = ContextPlaceConnectorFactory.get(this);
        mContextPlaceConnector.addPlaceEventListener(this);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mContextCoreConnector.removeContentListener(this);
        mContextPlaceConnector.removePlaceEventListener(this);
    }

    @Override
    public void contentEvent(ContentEvent contentEvent) {
        final ContentDescriptor descriptor = contentEvent.getContent().get(0);
        String couponId = descriptor.getContentAttributes().getStringAttribute("offerid");

        new CouponStateFetcher(this, new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                try {
                    prepareContentEventNotification(descriptor, content);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }, couponId).execute();
    }

    @Override
    public void placeEvent(PlaceEvent placeEvent) {
        final String locationId = placeEvent.getPlace()
                .getPlaceAttributes()
                .get("locationId");
        final String eventType = placeEvent.getEventType();

        new LocationStateFetcher(this, new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                try {
                    prepareUserRegistrationAtLocation(content, locationId, eventType);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }, locationId).execute();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void prepareContentEventNotification(ContentDescriptor descriptor, JSONArray content) throws JSONException {
        if (content == null || !shouldNotifyContentEvent(content)) {
            return;
        }

        final String couponId = descriptor.getContentAttributes().getStringAttribute("offerid");
        final String title = descriptor.getContentAttributes().getStringAttribute("title");
        final String subtitle = descriptor.getContentAttributes().getStringAttribute("subtitle");
        final String clientName = descriptor.getContentAttributes().getStringAttribute("client_name");
        String clientlogo = descriptor.getContentAttributes().getStringAttribute("client_logo");

        new ImageFetcher(clientlogo, new ImageFetcher.OnImageFetchedListener() {
            @Override
            public void onImageFetched(Bitmap bitmap) {
                if (bitmap == null) {
                    bitmap = BitmapFactory.decodeResource(
                            getResources(), R.drawable.ic_picture);
                }

                notifyContentEvent(
                        couponId,
                        title,
                        subtitle,
                        clientName,
                        bitmap);
            }
        }).execute();
    }

    private boolean shouldNotifyContentEvent(JSONArray content) throws JSONException {
        if (content == null) {
            return false;
        }

        JSONObject json = content.getJSONObject(0);
        String couponState = json.getString("State");

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        boolean userLogin = preferences.getBoolean(PlaceholderFragment.USER_LOGIN_PREF, false);

        return couponState.equals("True") && userLogin;
    }

    private void notifyContentEvent(
            String couponId,
            String title,
            String text,
            String info,
            Bitmap icon) {

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.drawable.ic_launcher)
                .setLargeIcon(icon)
                .setContentTitle(title)
                .setContentText(text)
                .setContentInfo(info)
                .setDefaults(Notification.DEFAULT_ALL)
                .setAutoCancel(true);
        Intent resultIntent = new Intent(this, CouponActivity.class);
        resultIntent.putExtra(CouponActivity.COUPON_ID_KEY, couponId);
        resultIntent.putExtra(CouponActivity.COUPON_TITLE_KEY, title);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
        stackBuilder.addParentStack(CouponActivity.class);
        stackBuilder.addNextIntent(resultIntent);

        PendingIntent resultPendingIntent = stackBuilder.getPendingIntent(
                Integer.valueOf(couponId),
                PendingIntent.FLAG_UPDATE_CURRENT);
        builder.setContentIntent(resultPendingIntent);
        NotificationManager manager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(Integer.valueOf(couponId), builder.build());
    }

    private void prepareUserRegistrationAtLocation(JSONArray content, String locationId, String eventType) throws JSONException {
        if (content == null || !shouldRegisterUserAtLocation(content)) {
            return;
        }

        final String id = locationId;
        final String event = eventType;
        LocationClientManager manager = new LocationClientManager(getApplicationContext()) {

            @Override
            public void onConnected(Bundle bundle) {
                super.onConnected(bundle);
                registerUserAtLocation(id, event);
                disconnect();
            }

            @Override
            public void onConnectionFailed(ConnectionResult connectionResult) {
                registerUserAtLocation(id, event);
            }
        };
        manager.connect();
    }

    private boolean shouldRegisterUserAtLocation(JSONArray content) throws JSONException {
        if (content == null) {
            return false;
        }

        JSONObject json = content.getJSONObject(0);
        int locationState = json.getInt("State");

        return locationState == 1;
    }

    private void registerUserAtLocation(String locationId, String eventType) {
        new RegisterUserAtLocation(this, locationId, eventType).execute();
    }

    private static class CouponStateFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String mCouponId;

        public CouponStateFetcher(Context context, OnContentFetchedListener listener, String couponId) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mCouponId = couponId;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet(
                    "http://geomex-gimbal.no-ip.org:5000/"
                    + getUserId() + "/"
                    + getTimeZone()
                    + "/GetOffers/"
                    + mCouponId
                    + "/ShowGeoMessage");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

    private static class LocationStateFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String mLocationId;

        public LocationStateFetcher(Context context, OnContentFetchedListener listener, String locationId) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mLocationId = locationId;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet(
                    "http://geomex-gimbal.no-ip.org:4000/"
                    + getUserId()
                    + "/IsLocationActive/"
                    + mLocationId);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

    private static class RegisterUserAtLocation extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String mLocationId;
        private String mEventType;

        public RegisterUserAtLocation(Context context, String locationId, String eventType) {
            super(context, null, null);
            setContentFetcherHelper(this);
            mLocationId = locationId;
            mEventType = eventType;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpPost post = new HttpPost("http://geomex-gimbal.no-ip.org:8000/Register");
            String userData = getUserData(Integer.valueOf(mLocationId), mEventType);
            StringEntity entity = new StringEntity(userData);

            entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
            post.setHeader(new BasicHeader("Content-Type", "application/json"));
            post.setEntity(entity);
            client.execute(post);
            return null;
        }
    }
}
