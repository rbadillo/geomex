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
import android.widget.AdapterView;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.facebook.Request;
import com.facebook.Response;
import com.facebook.Session;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
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
 * Created by adriangarcia on 14/12/13.
 */
public class ContentSocial extends Fragment {

    private static final String NET_ERROR_TAG = "networkError";

    private ListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;

    public ContentSocial() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_social, container, false);
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
        mList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(getActivity(), UserActivity.class);
                intent.putExtra(UserActivity.USER_ID_KEY, mContentAdapter.getItemIdAsString(position));
                intent.putExtra(UserActivity.USER_NAME_KEY, mContentAdapter.getItemName(position));
                startActivity(intent);
            }
        });

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
                mContentAdapter.setContent(content);
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
                        .show(ContentSocial.this)
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
                            .show(ContentSocial.this)
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

    private static class MyContentAdapter extends ContentAdapter {

        private static final int USER_ID = 0;
        private static final int USER_NAME = 1;
        private static final int USER_PHOTO = 2;
        private static final int LOCATION_NAME = 3;
        private static final int VISIT_DATE = 4;

        public MyContentAdapter(Context context, JSONArray content) {
            super(context, content);
            ITEM_ID = USER_ID;
            ITEM_NAME = USER_NAME;
            ITEM_SIZE = 5;
        }

        @Override
        protected String[] getItemAsStringArray(int position) {
            try {
                JSONObject json = mContent.getJSONObject(position);
                String[] item = new String[ITEM_SIZE];

                item[USER_ID] = json.getString("UserId");
                item[USER_NAME] = json.getString("FbName") + " " + json.getString("FbLastName");
                item[USER_PHOTO] = json.getString("FbPhoto");
                item[LOCATION_NAME] = json.getString("LocationName");
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
            View viewItem = inflater.inflate(R.layout.content_social_list_item, parent, false);
            ImageView photo = (ImageView) viewItem.findViewById(R.id.user_photo);
            TextView name = (TextView) viewItem.findViewById(R.id.user_name);
            TextView location = (TextView) viewItem.findViewById(R.id.location_name);
            TextView time = (TextView) viewItem.findViewById(R.id.time_created);

            String[] item = getItemAsStringArray(position);
            fetchImage(photo, item[USER_ID], item[USER_PHOTO], R.drawable.ic_person);
            name.setText(item[USER_NAME]);
            location.setText(item[LOCATION_NAME]);
            time.setText(getDisplayDate(item[VISIT_DATE]));
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
            HttpPost post = new HttpPost(
                    "http://geomex-gimbal.no-ip.org:4000/"
                            + getUserId()
                            + "/GetFriendsPlaces");
            String friendList = fetchFriendList();
            StringEntity entity = new StringEntity(friendList);

            entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
            post.setHeader(new BasicHeader("Content-Type", "application/json"));
            post.setEntity(entity);

            HttpResponse response = client.execute(post);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }

        //includes the user's id
        private String fetchFriendList() throws JSONException {
            Bundle params = new Bundle();
            Request friendsRequest = Request.newMyFriendsRequest(Session.getActiveSession(), null);
            params.putString("fields", "id");
            friendsRequest.setParameters(params);

            Response myFriends = friendsRequest.executeAndWait();
            if (myFriends.getGraphObject() == null) {
                return "";
            }

            JSONArray friendList = myFriends.getGraphObject().getInnerJSONObject().getJSONArray("data");
            String message = "{\"friend_list\":[";

            for (int i = 0; i < friendList.length(); i++) {
                message += ((JSONObject) friendList.get(i)).getString("id") + ",";
            }
            message += getUserId() + "]}";
            return message;
        }
    }
}
