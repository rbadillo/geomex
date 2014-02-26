package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
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
 * Created by adriangarcia on 16/12/13.
 */
public class UserActivity extends ActionBarActivity {

    public static final String USER_ID_KEY = "userId";
    public static final String USER_NAME_KEY = "userName";

    private ImageView mUserPhoto;
    private TextView mUserName;
    private ListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;
    private AsyncTask mContentDownload2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user);

        LayoutInflater inflater = getLayoutInflater();
        View header = inflater.inflate(R.layout.activity_user_header, null, false);

        mUserPhoto = (ImageView) header.findViewById(R.id.user_photo);
        mUserName = (TextView) header.findViewById(R.id.user_name);

        mList = (ListView) findViewById(R.id.list);
        mProgress = (ProgressBar) findViewById(R.id.progress);
        mEmpty = (TextView) findViewById(R.id.empty);

        mContentAdapter = new MyContentAdapter(this, null);

        mUserName.setText(getUserName());
        mList.addHeaderView(header);
        mList.setAdapter(mContentAdapter);

        String title = getResources().getString(R.string.activity_user_title);
        getSupportActionBar().setTitle(getUserName() + title);
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
        if (mContentDownload2 != null) {
            mContentDownload2.cancel(true);
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

    private String getUserId() {
        return getIntent().getStringExtra(USER_ID_KEY);
    }

    private String getUserName() {
        return getIntent().getStringExtra(USER_NAME_KEY);
    }

    private void refreshContent() {
        String url = "https://graph.facebook.com/"
                + getUserId()
                + "/picture?width=288&height=288";
        mContentDownload = new ImageFetcher(url, new ImageFetcher.OnImageFetchedListener() {
            @Override
            public void onImageFetched(Bitmap bitmap) {
                mUserPhoto.setImageBitmap(bitmap);
                mContentDownload = null;
            }
        }).execute();

        mContentDownload2 = new MyContentFetcher(this, new ContentFetcher.OnContentFetchedListener() {
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
                mContentDownload2 = null;
            }
        }, getUserId()).execute();
    }

    private static class MyContentAdapter extends ContentAdapter {

        private static final int LOCATION_NAME = 0;
        private static final int CLIENT_NAME = 1;
        private static final int CLIENT_LOGO = 2;
        private static final int VISIT_DATE = 3;

        public MyContentAdapter(Context context, JSONArray content) {
            super(context, content);
            ITEM_SIZE = 4;
        }

        @Override
        protected String[] getItemAsStringArray(int position) {
            try {
                JSONObject json = mContent.getJSONObject(position);
                String[] item = new String[ITEM_SIZE];

                item[LOCATION_NAME] = json.getString("LocationName");
                item[CLIENT_NAME] = json.getString("Name");
                item[CLIENT_LOGO] = json.getString("Logo");
                item[VISIT_DATE] = json.getString("TimeCreated");

                return item;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.activity_user_list_item, parent, false);
            ImageView logo = (ImageView) viewItem.findViewById(R.id.logo);
            TextView location = (TextView) viewItem.findViewById(R.id.location_name);
            TextView time = (TextView) viewItem.findViewById(R.id.time_created);

            String[] item = getItemAsStringArray(position);
            fetchImage(logo, item[CLIENT_NAME], item[CLIENT_LOGO], R.drawable.ic_picture);
            location.setText(item[LOCATION_NAME]);
            time.setText(getDisplayDate(item[VISIT_DATE]));
            return viewItem;
        }
    }

    private static class MyContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String mUserId;

        public MyContentFetcher(Context context, OnContentFetchedListener listener, String userId) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mUserId = userId;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet(
                    "http://geomex-gimbal.no-ip.org:4000/"
                            + getUserId() //logged-in user ID
                            + "/GetLocationsByUser/"
                            + mUserId);    //ID of the friend for whom to fetch locations

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
