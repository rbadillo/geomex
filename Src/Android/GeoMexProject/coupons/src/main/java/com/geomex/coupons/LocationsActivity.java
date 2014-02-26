package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;

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
 * Created by adriangarcia on 05/01/14.
 */
public class LocationsActivity extends ActionBarActivity {

    public static final String CLIENT_ID_KEY = "clientId";
    public static final String CLIENT_NAME_KEY = "clientName";

    private ListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_locations);

        mList = (ListView) findViewById(R.id.list);
        mProgress = (ProgressBar) findViewById(R.id.progress);
        mEmpty = (TextView) findViewById(R.id.empty);

        mContentAdapter = new MyContentAdapter(this, null);

        mList.setAdapter(mContentAdapter);

        String title = getResources().getString(R.string.activity_locations_title);
        getSupportActionBar().setTitle(getClientName() + title);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    }

    @Override
    protected void onStart() {
        super.onStart();
        refreshContent();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mContentAdapter.cancelAllDownloads();
        if (mContentDownload != null) {
            mContentDownload.cancel(true);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == android.R.id.home) {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private String getClientId() {
        return getIntent().getStringExtra(CLIENT_ID_KEY);
    }

    private String getClientName() {
        return getIntent().getStringExtra(CLIENT_NAME_KEY);
    }

    private void refreshContent() {
        mContentDownload = new MyContentFetcher(this, new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                mContentAdapter.setContent(content);
                mContentAdapter.notifyDataSetChanged();

                mProgress.setVisibility(View.GONE);
                if (content != null && content.length() == 0) {
                    mEmpty.setVisibility(View.VISIBLE);
                } else {
                    mEmpty.setVisibility(View.GONE);
                }
                mContentDownload = null;
            }
        }, getClientId()).execute();
    }

    private static class MyContentAdapter extends ContentAdapter {

        private static final int LOCATION_ID = 0;
        private static final int LOCATION_NAME = 2;
        private static final int LOCATION_PHOTO = 3;
        private static final int LOCATION_ADDRESS = 4;
        private static final int CITY_AND_STATE = 5;
        private static final int ZIP_CODE = 6;
        private static final int LATITUDE = 7;
        private static final int LONGITUDE = 8;

        public MyContentAdapter(Context context, JSONArray content) {
            super(context, content);
            ITEM_ID = LOCATION_ID;
            ITEM_NAME = LOCATION_NAME;
            ITEM_SIZE = 9;
        }

        @Override
        protected String[] getItemAsStringArray(int position) {
            try {
                JSONObject jsonItem = mContent.getJSONObject(position);
                String[] item = new String[ITEM_SIZE];

                item[LOCATION_ID] = jsonItem.getString("LocationId");
                item[LOCATION_NAME] = jsonItem.getString("Name");
                item[LOCATION_PHOTO] = jsonItem.getString("LocationPhoto");
                item[LOCATION_ADDRESS] = jsonItem.getString("Address");
                item[CITY_AND_STATE] = jsonItem.getString("City")
                        + ", " + jsonItem.getString("State");
                item[ZIP_CODE] = jsonItem.getString("ZipCode");
                item[LATITUDE] = jsonItem.getString("Latitude");
                item[LONGITUDE] = jsonItem.getString("Longitude");

                return item;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.activity_locations_list_item, parent, false);
            ImageView locationPhoto = (ImageView) viewItem.findViewById(R.id.location_photo);
            TextView name = (TextView) viewItem.findViewById(R.id.name);
            TextView address = (TextView) viewItem.findViewById(R.id.address);
            TextView cityState = (TextView) viewItem.findViewById(R.id.city_and_state);
            TextView zipCode = (TextView) viewItem.findViewById(R.id.zip_code);
            Button goToMap = (Button) viewItem.findViewById(R.id.go_to_map);

            final String[] item = getItemAsStringArray(position);
            fetchImage(locationPhoto, item[LOCATION_ID], item[LOCATION_PHOTO], R.drawable.ic_picture);
            name.setText(item[LOCATION_NAME]);
            address.setText(item[LOCATION_ADDRESS]);
            cityState.setText(item[CITY_AND_STATE]);
            zipCode.setText(item[ZIP_CODE]);

            goToMap.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Uri uri = Uri.parse("geo:"
                            + item[LATITUDE] + ","
                            + item[LONGITUDE] + "?q="
                            + item[LATITUDE] + ","
                            + item[LONGITUDE] + "("
                            + item[LOCATION_NAME] + ")");
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    mContext.startActivity(intent);
                }
            });
            return viewItem;
        }
    }

    private static class MyContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String mClientId;

        public MyContentFetcher(Context context, OnContentFetchedListener listener, String clientId) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mClientId = clientId;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet("http://geomex-gimbal.no-ip.org:4000/"
                    + getUserId()
                    + "/GetClientLocations/"
                    + mClientId);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
