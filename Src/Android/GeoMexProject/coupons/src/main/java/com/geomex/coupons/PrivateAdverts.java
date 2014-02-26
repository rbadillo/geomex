package com.geomex.coupons;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
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
 * Created by adriangarcia on 18/12/13.
 */
public class PrivateAdverts extends Fragment {

    private ListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;

    public PrivateAdverts() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.private_adverts, container, false);
        return rootView;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        mList = (ListView) view.findViewById(R.id.list);
        mProgress = (ProgressBar) view.findViewById(R.id.progress);
        mEmpty = (TextView) view.findViewById(R.id.empty);

        mContentAdapter = new MyContentAdapter(getActivity(), null);
        mList.setAdapter(mContentAdapter);
    }

    @Override
    public void onStart() {
        super.onStart();
        refreshContent();
    }

    @Override
    public void onStop() {
        super.onStop();
        mContentAdapter.cancelAllDownloads();
        if (mContentDownload != null) {
            mContentDownload.cancel(true);
        }
    }

    private void refreshContent() {
        mContentDownload = new MyContentFetcher(getActivity(), new ContentFetcher.OnContentFetchedListener() {
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
        }).execute();
    }

    private static class MyContentAdapter extends ContentAdapter {

        private static final int CLIENT_NAME = 0;
        private static final int CLIENT_LOGO = 1;
        private static final int MESSAGE = 2;
        private static final int PUBLISH_DATE = 3;

        public MyContentAdapter(Context context, JSONArray content) {
            super(context, content);
            ITEM_SIZE = 4;
        }

        @Override
        protected String[] getItemAsStringArray(int position) {
            try {
                JSONObject json = mContent.getJSONObject(position);
                String[] item = new String[ITEM_SIZE];

                item[CLIENT_NAME] = json.getString("ClientName");
                item[CLIENT_LOGO] = json.getString("Logo");
                item[MESSAGE] = json.getString("Message");
                item[PUBLISH_DATE] = json.getString("TimeCreated");

                return item;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.private_adverts_list_item, parent, false);
            TextView name = (TextView) viewItem.findViewById(R.id.client_name);
            ImageView logo = (ImageView) viewItem.findViewById(R.id.logo);
            TextView message = (TextView) viewItem.findViewById(R.id.message);
            TextView time = (TextView) viewItem.findViewById(R.id.time_created);

            String[] item = getItemAsStringArray(position);
            name.setText(item[CLIENT_NAME]);
            fetchImage(logo, item[CLIENT_NAME], item[CLIENT_LOGO], R.drawable.ic_picture);
            message.setText(item[MESSAGE]);
            time.setText(getDisplayDate(item[PUBLISH_DATE]));
            return viewItem;
        }
    }

    private static class MyContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        public MyContentFetcher(Context context, OnContentFetchedListener listener) {
            super(context, null, listener);
            setContentFetcherHelper(this);
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet("http://geomex-gimbal.no-ip.org:4000/" + getUserId() + "/GetMessagesReceivedByUser");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
