package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.view.View;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.location.LocationClient;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Created by adriangarcia on 02/03/14.
 */
public class MapsFragment extends SupportMapFragment {

    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

    private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

    private LocationClient locationClient;

    public static MapsFragment newInstance() {
        MapsFragment fragment = new MapsFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        final FragmentManager fm = getFragmentManager();
        final NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

        if (fragment != null) {
            NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                @Override
                public void onActionRetry() {
                    fm.beginTransaction()
                            .show(MapsFragment.this)
                            .remove(fragment)
                            .commit();

                    updateUserLocation();
                }
            };
            fragment.setCallbacks(callbacks);

            fm.beginTransaction()
                    .hide(this)
                    .commit();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (!checkPlayServices()) return;

        if (!errorFragmentShown()) {
            updateUserLocation();
        }

        GoogleMap map = getMap();
        GoogleMap.OnInfoWindowClickListener listener = new GoogleMap.OnInfoWindowClickListener() {
            @Override
            public void onInfoWindowClick(Marker marker) {
                LatLng latLng = marker.getPosition();
                double src_latitude = Preferences.getUserLocationLatitude(getActivity());
                double src_longitude = Preferences.getUserLocationLongitude(getActivity());
                double dest_latitude = latLng.latitude;
                double dest_longitude = latLng.longitude;

                Uri uri = Uri.parse("http://maps.google.com/maps?saddr=" + src_latitude +
                                    "," + src_longitude +
                                    "&daddr=" + dest_latitude +
                                    "," + dest_longitude);
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                startActivity(intent);
            }
        };
        map.setOnInfoWindowClickListener(listener);
    }

    private boolean checkPlayServices() {
        int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(getActivity());
        if (resultCode != ConnectionResult.SUCCESS) {
            if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
                GooglePlayServicesUtil.getErrorDialog(resultCode, getActivity(),
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            }
            return false;
        }
        return true;
    }

    private void updateUserLocation() {
        final Context context = getActivity();
        GooglePlayServicesClient.ConnectionCallbacks callbacks = new GooglePlayServicesClient.ConnectionCallbacks() {
            @Override
            public void onConnected(Bundle bundle) {
                Location location = locationClient.getLastLocation();

                if (location != null) {
                    Preferences.setUserLocationLatitude(context, location.getLatitude());
                    Preferences.setUserLocationLongitude(context, location.getLongitude());
                    setCurrentLocation();
                    fetchClosestLocations();
                } else {
                    Toast toast = Toast.makeText(getActivity(), R.string.navigation_maps_not_available, Toast.LENGTH_LONG);
                    toast.show();
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
                showErrorFragment();
            }
        };
        locationClient = new LocationClient(getActivity(), callbacks, listener);
        locationClient.connect();
    }

    private void setCurrentLocation() {
        double latitude = Preferences.getUserLocationLatitude(getActivity());
        double longitude = Preferences.getUserLocationLongitude(getActivity());

        GoogleMap map = getMap();
        LatLng latLng = new LatLng(latitude, longitude);
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 12));
        map.setMyLocationEnabled(true);
    }

    private void fetchClosestLocations() {
        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                if (content == null) {
                    showErrorFragment();
                    return;
                } else if (content.length() == 0) {
                    Toast toast = Toast.makeText(getActivity(), R.string.content_empty, Toast.LENGTH_LONG);
                    toast.show();
                } else {
                    setClosestLocations(content);
                }
            }
        };
        ClosestLocationsFetcher closestLocationsFetcher = new ClosestLocationsFetcher(getActivity());
        closestLocationsFetcher.setCallbacks(callbacks);
        closestLocationsFetcher.execute();
    }

    private void setClosestLocations(JSONArray content) {
        if (content == null) return;

        try {
            GoogleMap map = getMap();
            for (int i = 0; i < content.length(); i++) {
                JSONObject json = content.getJSONObject(i);

                String name = json.getString("Name");
                double latitude = json.getDouble("Latitude");
                double longitude = json.getDouble("Longitude");

                if (isAdded()) {
                    String getDirections = getResources().getString(R.string.maps_get_directions);

                    LatLng latLng = new LatLng(latitude, longitude);
                    map.addMarker(new MarkerOptions()
                            .title(name)
                            .position(latLng)
                            .snippet(getDirections));
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void showErrorFragment() {
        final FragmentManager fm = getFragmentManager();
        final NetworkErrorFragment fragment = new NetworkErrorFragment();

        if (fm == null) return; //FragmentManager will be null when the user
                                 // has changed section already

        NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
            @Override
            public void onActionRetry() {
                fm.beginTransaction()
                        .show(MapsFragment.this)
                        .remove(fragment)
                        .commit();

                updateUserLocation();
            }
        };
        fragment.setCallbacks(callbacks);

        fm.beginTransaction()
                .hide(this)
                .add(R.id.content_frame, fragment, TAG_NETWORK_ERROR_FRAGMENT)
                .commit();
    }

    private boolean errorFragmentShown() {
        FragmentManager fm = getFragmentManager();
        NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);
        return fragment != null && fragment.isAdded();
    }

    private static class ClosestLocationsFetcher extends RemoteContentFetcher {
        private Context context;

        public ClosestLocationsFetcher(Context context) {
            super();
            this.context = context;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            double latitude = Preferences.getUserLocationLatitude(context);
            double longitude = Preferences.getUserLocationLongitude(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + userId +
                                      "/GetClosestLocations/" + latitude +
                                      "/" + longitude);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
