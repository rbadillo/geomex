package com.geomex.coupons;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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
 * Created by adriangarcia on 18/12/13.
 */
public class PublicAdverts extends Fragment {

    private static final String NET_ERROR_TAG = "networkError";

    private ExpandableListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private MyContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;
    private AsyncTask mContentDownload2;

    public PublicAdverts() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.public_adverts, container, false);
        return rootView;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        mList = (ExpandableListView) view.findViewById(R.id.list);
        mProgress = (ProgressBar) view.findViewById(R.id.progress);
        mEmpty = (TextView) view.findViewById(R.id.empty);

        mContentAdapter = new MyContentAdapter(getActivity(), null, null);
        mList.setAdapter(mContentAdapter);

        reconnectNetworkErrorFragment();
    }

    @Override
    public void onStart() {
        super.onStart();
        if (!networkErrorFragmentIsShown()) {
            refreshGroupContent();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        mContentAdapter.cancelAllDownloads();
        if (mContentDownload != null) {
            mContentDownload.cancel(true);
        }
        if (mContentDownload2 != null) {
            mContentDownload2.cancel(true);
        }
    }

    private void refreshGroupContent() {
        mContentDownload = new GroupContentFetcher(getActivity(), new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                mContentAdapter.setGroupContent(content);
                mContentAdapter.setChildrenContent(null);
                mContentAdapter.notifyDataSetChanged();

                mProgress.setVisibility(View.GONE);
                if (content == null) {
                    handleNetworkError();
                    return;
                }

                if (content.length() == 0) {
                    mEmpty.setVisibility(View.VISIBLE);
                } else {
                    refreshChildrenContent();
                    mEmpty.setVisibility(View.GONE);
                }
                mContentDownload = null;
            }
        }).execute();
    }

    private void refreshChildrenContent() {
        int groupCount = mContentAdapter.getGroupCount();
        String[] clientsIds = new String[groupCount];
        for (int i = 0; i < groupCount; i++) {
            clientsIds[i] = mContentAdapter.getGroupIdAsString(i);
        }

        mContentDownload2 = new ChildrenContentFetcher(getActivity(), new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                mContentAdapter.setChildrenContent(content);
                mContentAdapter.notifyDataSetChanged();
                mContentDownload2 = null;
            }
        }, clientsIds).execute();
    }

    private void handleNetworkError() {
        final Fragment parentFragment = getParentFragment();
        final NetworkError fragment = new NetworkError();
        final FragmentManager fm = parentFragment.getFragmentManager();


        NetworkError.NetworkErrorHandler handler = new NetworkError.NetworkErrorHandler() {

            @Override
            public void onRequestNewAttempt() {
                fm.beginTransaction()
                        .show(parentFragment)
                        .remove(fragment)
                        .commit();

                mProgress.setVisibility(View.VISIBLE);
                refreshGroupContent();
            }
        };
        fragment.setNetworkErrorHandler(handler);

        fm.beginTransaction()
                .hide(parentFragment)
                .add(R.id.content_frame, fragment, NET_ERROR_TAG)
                .commit();
    }

    private void reconnectNetworkErrorFragment() {
        final Fragment parentFragment = getParentFragment();
        final FragmentManager fm = parentFragment.getFragmentManager();
        final NetworkError fragment = (NetworkError) fm.findFragmentByTag(NET_ERROR_TAG);

        if (fragment != null) {
            NetworkError.NetworkErrorHandler handler = new NetworkError.NetworkErrorHandler() {

                @Override
                public void onRequestNewAttempt() {
                    fm.beginTransaction()
                            .show(parentFragment)
                            .remove(fragment)
                            .commit();

                    mProgress.setVisibility(View.VISIBLE);
                    refreshGroupContent();
                }
            };
            fragment.setNetworkErrorHandler(handler);

            fm.beginTransaction()
                    .hide(parentFragment)
                    .commit();
        }
    }

    private boolean networkErrorFragmentIsShown() {
        Fragment parentFragment = getParentFragment();
        FragmentManager fm = parentFragment.getFragmentManager();
        NetworkError fragment = (NetworkError) fm.findFragmentByTag(NET_ERROR_TAG);

        return fragment != null && fragment.isAdded();
    }

    private static class MyContentAdapter extends ExpandableContentAdapter {

        private static final int CLIENT_ID = 0;
        private static final int CLIENT_NAME = 1;
        private static final int CLIENT_LOGO = 2;

        private static final int MESSAGE = 0;
        private static final int PUBLISH_DATE = 1;

        public MyContentAdapter(Context context, JSONArray groupContent, JSONArray childrenContent) {
            super(context, groupContent, childrenContent);
            GROUP_ID = CLIENT_ID;
            GROUP_NAME = CLIENT_NAME;
            GROUP_SIZE = 3;

            CHILD_SIZE = 2;
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
            try {
                JSONObject json = ((JSONArray) mChildrenContent.get(groupPosition))
                        .getJSONObject(childPosition);
                String[] child = new String[CHILD_SIZE];

                child[MESSAGE] = json.getString("Message");
                child[PUBLISH_DATE] = json.getString("TimeCreated");

                return child;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        public View getGroupView(int groupPosition, boolean isExpanded, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.public_adverts_group_list_item, parent, false);
            ImageView logo = (ImageView) viewItem.findViewById(R.id.logo);
            TextView name = (TextView) viewItem.findViewById(R.id.name);
            ProgressBar progress = (ProgressBar) viewItem.findViewById(R.id.progress);

            String[] group = getGroupAsStringArray(groupPosition);
            fetchImage(logo, group[CLIENT_ID], group[CLIENT_LOGO], R.drawable.ic_picture);
            name.setText(group[GROUP_NAME]);

            if (mChildrenContent == null) {
                progress.setVisibility(View.VISIBLE);
            } else {
                progress.setVisibility(View.GONE);
            }
            return viewItem;
        }

        @Override
        public View getChildView(int groupPosition, int childPosition, boolean isLastChild, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.public_adverts_child_list_item, parent, false);
            TextView message = (TextView) viewItem.findViewById(R.id.message);
            TextView time = (TextView) viewItem.findViewById(R.id.time_created);
            ImageView logo = (ImageView) viewItem.findViewById(R.id.logo);

            String[] group = getGroupAsStringArray(groupPosition);
            String[] child = getChildAsStringArray(groupPosition, childPosition);
            message.setText(child[MESSAGE]);
            time.setText(getDisplayDate(child[PUBLISH_DATE]));
            logo.setImageBitmap(mMemoryCache.get(group[CLIENT_ID]));
            return viewItem;
        }
    }

    private static class GroupContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        public GroupContentFetcher(Context context, OnContentFetchedListener listener) {
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

    private static class ChildrenContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String[] mClientsIds;

        public ChildrenContentFetcher(Context context, OnContentFetchedListener listener, String[] clientIds) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mClientsIds = clientIds;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get;
            HttpResponse response;
            InputStream stream;
            BufferedReader reader;
            JSONTokener tokener;
            JSONArray content = new JSONArray();

            for (int i = 0; i < mClientsIds.length; i++) {
                get = new HttpGet(
                        "http://geomex-gimbal.no-ip.org:4000/"
                                + getUserId()
                                + "/GetMessagesSentByClient/"
                                + mClientsIds[i]);
                response = client.execute(get);
                stream = response.getEntity().getContent();
                reader = new BufferedReader(new InputStreamReader(stream));
                tokener = new JSONTokener(reader.readLine());
                content.put(new JSONArray(tokener));
            }
            return content;
        }
    }
}
