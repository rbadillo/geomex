package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ExpandableListView;
import android.widget.ImageView;
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
 * Created by adriangarcia on 04/01/14.
 */
public class ContentPlaces extends Fragment {

    private static final String NET_ERROR_TAG = "networkError";

    private ExpandableListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ExpandableContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;

    public ContentPlaces() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_places, container, false);
        return rootView;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        mList = (ExpandableListView) view.findViewById(R.id.list);
        mProgress = (ProgressBar) view.findViewById(R.id.progress);
        mEmpty = (TextView) view.findViewById(R.id.empty);

        mContentAdapter = new MyContentAdapter(getActivity(), null);
        mList.setAdapter(mContentAdapter);

        reconnectNetworkErrorFragment();
    }

    @Override
    public void onStart() {
        super.onStart();
        if (!networkErrorFragmentIsShown()) {
            refreshContent();
        }
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
                mContentAdapter.setGroupContent(content);
                mContentAdapter.notifyDataSetChanged();

                mProgress.setVisibility(View.GONE);
                if (content == null) {
                    handleNetworkError();
                    return;
                }

                if (content.length() == 0) {
                    mEmpty.setVisibility(View.VISIBLE);
                } else {
                    mEmpty.setVisibility(View.GONE);
                }
                mContentDownload = null;
            }
        }).execute();
    }

    private void handleNetworkError() {
        final FragmentManager fm = getFragmentManager();
        final NetworkError fragment = new NetworkError();

        NetworkError.NetworkErrorHandler handler = new NetworkError.NetworkErrorHandler() {

            @Override
            public void onRequestNewAttempt() {
                fm.beginTransaction()
                        .show(ContentPlaces.this)
                        .remove(fragment)
                        .commit();

                mProgress.setVisibility(View.VISIBLE);
                refreshContent();
            }
        };
        fragment.setNetworkErrorHandler(handler);

        fm.beginTransaction()
                .hide(this)
                .add(R.id.content_frame, fragment, NET_ERROR_TAG)
                .commit();
    }

    private void reconnectNetworkErrorFragment() {
        final FragmentManager fm = getFragmentManager();
        final NetworkError fragment = (NetworkError) fm.findFragmentByTag(NET_ERROR_TAG);

        if (fragment != null) {
            NetworkError.NetworkErrorHandler handler = new NetworkError.NetworkErrorHandler() {

                @Override
                public void onRequestNewAttempt() {
                    fm.beginTransaction()
                            .show(ContentPlaces.this)
                            .remove(fragment)
                            .commit();

                    mProgress.setVisibility(View.VISIBLE);
                    refreshContent();
                }
            };
            fragment.setNetworkErrorHandler(handler);

            fm.beginTransaction()
                    .hide(this)
                    .commit();
        }
    }

    private boolean networkErrorFragmentIsShown() {
        FragmentManager fm = getFragmentManager();
        NetworkError fragment = (NetworkError) fm.findFragmentByTag(NET_ERROR_TAG);

        return fragment != null && fragment.isAdded();
    }

    private static class MyContentAdapter extends ExpandableContentAdapter {
        /*
         *
         * This is a special case of ExpandableContentAdapter in which
         * we do not have children content; thus, we override getChildrenCount
         * in order to return always 1.
         *
         */

        private static final int CLIENT_ID = 0;
        private static final int CLIENT_NAME = 1;
        private static final int CLIENT_LOGO = 2;

        public MyContentAdapter(Context context, JSONArray groupContent) {
            super(context, groupContent, null);
            GROUP_ID = CLIENT_ID;
            GROUP_NAME = CLIENT_NAME;
            GROUP_SIZE = 3;
        }

        @Override
        protected String[] getGroupAsStringArray(int groupPosition) {
            try {
                JSONObject json = mGroupContent.getJSONObject(groupPosition);
                String[] group = new String[GROUP_SIZE];

                group[CLIENT_ID] = json.getString("ClientId");
                group[CLIENT_NAME] = json.getString("Name");
                group[CLIENT_LOGO] = json.getString("Logo");

                return group;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected String[] getChildAsStringArray(int groupPosition, int childPosition) {
            return null;
        }

        @Override
        public View getGroupView(int groupPosition, boolean isExpanded, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.content_places_group_list_item, parent, false);
            ImageView logo = (ImageView) viewItem.findViewById(R.id.logo);
            TextView name = (TextView) viewItem.findViewById(R.id.name);

            String[] group = getGroupAsStringArray(groupPosition);
            fetchImage(logo, group[CLIENT_ID], group[CLIENT_LOGO], R.drawable.ic_picture);
            name.setText(group[CLIENT_NAME]);
            return viewItem;
        }

        @Override
        public View getChildView(int groupPosition, int childPosition, boolean isLastChild, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.content_places_child_list_item, parent, false);
            Button locations = (Button) viewItem.findViewById(R.id.list);
            Button coupons = (Button) viewItem.findViewById(R.id.coupons);

            final String[] group = getGroupAsStringArray(groupPosition);
            locations.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(mContext, LocationsActivity.class);
                    intent.putExtra(LocationsActivity.CLIENT_ID_KEY, group[CLIENT_ID]);
                    intent.putExtra(LocationsActivity.CLIENT_NAME_KEY, group[CLIENT_NAME]);
                    mContext.startActivity(intent);
                }
            });
            coupons.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(mContext, ClientCouponsActivity.class);
                    intent.putExtra(LocationsActivity.CLIENT_ID_KEY, group[CLIENT_ID]);
                    intent.putExtra(LocationsActivity.CLIENT_NAME_KEY, group[CLIENT_NAME]);
                    mContext.startActivity(intent);
                }
            });

            return viewItem;
        }

        @Override
        public int getChildrenCount(int groupPosition) {
            return 1;
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
            HttpGet get = new HttpGet("http://geomex-gimbal.no-ip.org:4000/" + getUserId() + "/GetAllClients");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
