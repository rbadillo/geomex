package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.MenuItem;
import android.view.View;
import android.widget.CheckBox;
import android.widget.ProgressBar;

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
 * Created by adriangarcia on 17/01/14.
 */
public class SettingsActivity extends ActionBarActivity {

    private ProgressBar mProgress;
    private CheckBox mUpdateUserState;

    private AsyncTask mContentDownload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        mProgress = (ProgressBar) findViewById(R.id.progress);
        mUpdateUserState = (CheckBox) findViewById(R.id.update_user_state);

        mUpdateUserState.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                updateUserState();
            }
        });

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

    private void refreshContent() {
        mContentDownload = new MyContentFetcher(this, new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                try {
                    showUserState(content);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                mContentDownload = null;
            }
        }).execute();
    }

    private void showUserState(JSONArray content) throws JSONException {
        if (content == null) {
            return;
        }

        JSONObject json = content.getJSONObject(0);
        int state = json.getInt("State");

        if (state == 0) {
            mUpdateUserState.setChecked(false);
        } else if (state == 1) {
            mUpdateUserState.setChecked(true);
        }

        mProgress.setVisibility(View.GONE);
        mUpdateUserState.setVisibility(View.VISIBLE);
    }

    private void updateUserState() {
        new UpdateUserState(this).execute();
    }

    private class MyContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        public MyContentFetcher(Context context, OnContentFetchedListener listener) {
            super(context, null, listener);
            setContentFetcherHelper(this);
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet("http://geomex-gimbal.no-ip.org:4000/" + getUserId() + "/GetUserActiveState");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

    private class UpdateUserState extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        public UpdateUserState(Context context) {
            super(context, null, null);
            setContentFetcherHelper(this);
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet("http://geomex-gimbal.no-ip.org:4000/" + getUserId() + "/UpdateUserActiveState");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
