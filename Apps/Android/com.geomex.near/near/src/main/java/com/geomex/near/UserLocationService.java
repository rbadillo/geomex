package com.geomex.near;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.location.Location;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.location.LocationClient;
import com.qualcommlabs.usercontext.ContentListener;
import com.qualcommlabs.usercontext.ContextCoreConnector;
import com.qualcommlabs.usercontext.ContextCoreConnectorFactory;
import com.qualcommlabs.usercontext.ContextPlaceConnector;
import com.qualcommlabs.usercontext.ContextPlaceConnectorFactory;
import com.qualcommlabs.usercontext.PlaceEventListener;
import com.qualcommlabs.usercontext.protocol.ContentAttributes;
import com.qualcommlabs.usercontext.protocol.ContentEvent;
import com.qualcommlabs.usercontext.protocol.PlaceEvent;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
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
import java.io.UnsupportedEncodingException;

/**
 * Created by adriangarcia on 16/03/14.
 */
public class UserLocationService extends Service implements PlaceEventListener, ContentListener {

    private ContextCoreConnector contextCoreConnector;
    private ContextPlaceConnector contextPlaceConnector;

    private LocationClient locationClient;

    @Override
    public void onCreate() {
        super.onCreate();

        contextCoreConnector = ContextCoreConnectorFactory.get(this);
        contextCoreConnector.addContentListener(this);

        contextPlaceConnector = ContextPlaceConnectorFactory.get(this);
        contextPlaceConnector.addPlaceEventListener(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return Service.START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        contextCoreConnector.removeContentListener(this);
        contextPlaceConnector.removePlaceEventListener(this);
    }

    @Override
    public void contentEvent(ContentEvent contentEvent) {
        ContentAttributes attributes = contentEvent.getContent()
                .get(0)
                .getContentAttributes();
        final Context context = this;
        final String locationId = attributes.getStringAttribute("location_id");
        final String clientId = attributes.getStringAttribute("client_id");
        final String clientName = attributes.getStringAttribute("client_name");
        final String clientLogo = attributes.getStringAttribute("client_logo");
        final String clientColor = attributes.getStringAttribute("client_hex_color");
        final String offerId = attributes.getStringAttribute("offer_id");
        final String offerTitle = attributes.getStringAttribute("offer_title");
        final String offerSubtitle = attributes.getStringAttribute("offer_subtitle");

        if (locationId == null || offerId == null) return;

        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                if (content == null) return;

                try {
                    JSONObject json = content.getJSONObject(0);

                    String offerState = json.getString("State");
                    boolean gimbalNotifEnabled = Preferences.getGimbalNotificationsEnabled(context);

                    if (offerState.equals("1") && gimbalNotifEnabled) {
                        notifyContentEvent(clientId,
                                           clientName,
                                           clientLogo,
                                           clientColor,
                                           offerId,
                                           offerTitle,
                                           offerSubtitle);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
        OfferStateFetcher offerStateFetcher = new OfferStateFetcher(this, clientId, locationId, offerId);
        offerStateFetcher.setCallbacks(callbacks);
        offerStateFetcher.execute();
    }

    @Override
    public void placeEvent(PlaceEvent placeEvent) {
        final Context context = this;
        final String locationId = placeEvent.getPlace()
                .getPlaceAttributes()
                .get("location_id");
        final String eventType = placeEvent.getEventType();

        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                if (content == null) return;

                try {
                    JSONObject json = content.getJSONObject(0);

                    String locationState = json.getString("State");
                    boolean gimbalNotifEnabled = Preferences.getGimbalNotificationsEnabled(context);

                    if (locationState.equals("1") && gimbalNotifEnabled) {
                        GooglePlayServicesClient.ConnectionCallbacks callbacks = new GooglePlayServicesClient.ConnectionCallbacks() {
                            @Override
                            public void onConnected(Bundle bundle) {
                                Location location = locationClient.getLastLocation();

                                if (location != null) {
                                    Preferences.setUserLocationLatitude(context, location.getLatitude());
                                    Preferences.setUserLocationLongitude(context, location.getLongitude());
                                }

                                locationClient.disconnect();
                                PlaceEventSender placeEventSender = new PlaceEventSender(context,
                                                                                         locationId,
                                                                                         eventType);
                                placeEventSender.execute();
                            }

                            @Override
                            public void onDisconnected() {

                            }
                        };
                        GooglePlayServicesClient.OnConnectionFailedListener listener = new GooglePlayServicesClient.OnConnectionFailedListener() {
                            @Override
                            public void onConnectionFailed(ConnectionResult connectionResult) {
                                PlaceEventSender placeEventSender = new PlaceEventSender(context,
                                                                                         locationId,
                                                                                         eventType);
                                placeEventSender.execute();
                            }
                        };
                        locationClient = new LocationClient(context, callbacks, listener);
                        locationClient.connect();
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
        LocationStateFetcher locationStateFetcher = new LocationStateFetcher(this, locationId);
        locationStateFetcher.setCallbacks(callbacks);
        locationStateFetcher.execute();
    }

    private void notifyContentEvent(final String clientId,
                                    final String clientName,
                                    final String clientLogo,
                                    final String clientColor,
                                    final String offerId,
                                    final String offerTitle,
                                    final String offerSubtitle) {

        final Context context = this;
        RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
            @Override
            public void onRemoteImageFetched(Bitmap image) {
                if (image == null) {
                    image = BitmapFactory.decodeResource(context.getResources(),
                                                         R.drawable.ic_picture_dark);
                };

                Intent resultIntent = new Intent(context, OffersActivity.class);
                resultIntent.putExtra(OffersActivity.EXTRA_CLIENT_ID, clientId);
                resultIntent.putExtra(OffersActivity.EXTRA_CLIENT_NAME, clientName);
                resultIntent.putExtra(OffersActivity.EXTRA_CLIENT_LOGO, clientLogo);
                resultIntent.putExtra(OffersActivity.EXTRA_CLIENT_COLOR, clientColor);

                TaskStackBuilder stackBuilder = TaskStackBuilder.create(context);
                stackBuilder.addParentStack(OffersActivity.class);
                stackBuilder.addNextIntent(resultIntent);

                PendingIntent pendingIntent = stackBuilder.getPendingIntent(
                        Integer.valueOf(offerId), PendingIntent.FLAG_UPDATE_CURRENT);

                NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
                        .setContentTitle(offerTitle)
                        .setContentText(offerSubtitle)
                        .setContentInfo(clientName)
                        .setSmallIcon(R.drawable.ic_stat_near)
                        .setLargeIcon(image)
                        .setDefaults(Notification.DEFAULT_ALL)
                        .setAutoCancel(true);
                builder.setContentIntent(pendingIntent);

                NotificationManager manager = (NotificationManager)
                        context.getSystemService(Context.NOTIFICATION_SERVICE);
                manager.notify(Integer.valueOf(offerId), builder.build());
            }
        };
        RemoteImageFetcher remoteImageFetcher = new RemoteImageFetcher(clientLogo);
        remoteImageFetcher.setCallbacks(callbacks);
        remoteImageFetcher.execute();
    }

    private static class OfferStateFetcher extends RemoteContentFetcher {
        private Context context;
        private String clientId;
        private String locationId;
        private String offerId;

        public OfferStateFetcher(Context context, String clientId, String locationId, String offerId) {
            super();
            this.context = context;
            this.clientId = clientId;
            this.locationId = locationId;
            this.offerId = offerId;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            HttpGet get = new HttpGet("http://near.noip.me/" + userId +
                                      "/" + userTimeZone +
                                      "/ShowGeoMessage/" + clientId +
                                      "/LocationId/" + locationId +
                                      "/OfferId/" + offerId);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

    private static class LocationStateFetcher extends RemoteContentFetcher {
        private Context context;
        private String locationId;

        public LocationStateFetcher(Context context, String locationId) {
            super();
            this.context = context;
            this.locationId = locationId;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            HttpGet get = new HttpGet("http://near.noip.me/" + userId +
                                      "/IsLocationActive/" + locationId);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

    private static class PlaceEventSender extends AsyncTask<Void, Void, Void> {
        private Context context;
        private String locationId;
        private String eventType;

        public PlaceEventSender(Context context, String locationId, String eventType) {
            super();
            this.context = context;
            this.locationId = locationId;
            this.eventType = eventType;
        }

        @Override
        protected Void doInBackground(Void... params) {
            String userId = Preferences.getUserFacebookId(context);
            HttpClient client = new DefaultHttpClient();
            HttpPost post = new HttpPost("http://near.noip.me/" + userId + "/GeoEvent");
            double latitude = Preferences.getUserLocationLatitude(context);
            double longitude = Preferences.getUserLocationLongitude(context);

            try {
                JSONObject json = new JSONObject();
                json.put("id", userId);
                json.put("location_id", locationId);
                json.put("latitude", latitude);
                json.put("longitude", longitude);
                json.put("event", eventType);

                String body = json.toString();
                StringEntity entity = new StringEntity(body);
                entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
                post.setHeader(new BasicHeader("Content-Type", "application/json"));
                post.setEntity(entity);
                client.execute(post);

            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            } catch (ClientProtocolException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

}
