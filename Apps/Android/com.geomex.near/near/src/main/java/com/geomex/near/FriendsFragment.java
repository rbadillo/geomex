package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

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
 * Created by adriangarcia on 02/03/14.
 */
public class FriendsFragment extends Fragment {

    private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

    private FriendsAdapter friendsAdapter;
    private ProgressBar progressView;
    private View emptyView;

    public static FriendsFragment newInstance() {
        FriendsFragment fragment = new FriendsFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_friends, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        friendsAdapter = new FriendsAdapter(getActivity());
        AdapterView.OnItemClickListener friendsListener = new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String userId = friendsAdapter.getUserId(position);
                String name = friendsAdapter.getUserName(position);

                Intent intent = new Intent(getActivity(), UserOffersActivity.class);
                intent.putExtra(UserOffersActivity.EXTRA_USER_ID, userId);
                intent.putExtra(UserOffersActivity.EXTRA_USER_NAME, name);
                startActivity(intent);
            }
        };
        android.widget.ListView friends = (android.widget.ListView) view.findViewById(R.id.friend_list);
        friends.setAdapter(friendsAdapter);
        friends.setOnItemClickListener(friendsListener);

        progressView = (ProgressBar) view.findViewById(R.id.progress_view);
        emptyView = view.findViewById(R.id.empty_view);

        final FragmentManager fm = getFragmentManager();
        final NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

        if (fragment != null) {
            NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                @Override
                public void onActionRetry() {
                    fm.beginTransaction()
                            .show(FriendsFragment.this)
                            .remove(fragment)
                            .commit();

                    progressView.setVisibility(View.VISIBLE);
                    refresh();
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

        if (!errorFragmentShown()) {
            refresh();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        friendsAdapter.cancelPendingTasks();
    }

    private void refresh() {
        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                friendsAdapter.changeRemoteContent(content);

                progressView.setVisibility(View.GONE);
                if (content == null) {
                    showErrorFragment();
                    return;
                } else if (content.length() == 0) {
                    emptyView.setVisibility(View.VISIBLE);
                } else {
                    emptyView.setVisibility(View.GONE);
                }
            }
        };
        FriendsFetcher friendsFetcher = new FriendsFetcher(getActivity());
        friendsFetcher.setCallbacks(callbacks);
        friendsFetcher.execute();
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
                        .show(FriendsFragment.this)
                        .remove(fragment)
                        .commit();

                progressView.setVisibility(View.VISIBLE);
                refresh();
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

    private static class FriendsAdapter extends RemoteContentAdapter {
        private static final int USER_ID = 0;
        private static final int USER_NAME = 1;
        private static final int USER_LASTNAME = 2;
        private static final int RESPONSE_SIZE = 3;

        private Context context;

        public FriendsAdapter(Context context) {
            super();
            this.context = context;
        }

        @Override
        public Object getItem(int position) {
            return null;
        }

        @Override
        public long getItemId(int position) {
            return 0;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View view = inflater.inflate(R.layout.friend_list_item, parent, false);

            String[] user = getUser(position);
            ImageView picture = (ImageView) view.findViewById(R.id.user_picture);
            TextView name = (TextView) view.findViewById(R.id.user_name);
            String userId = user[USER_ID];
            String url = "https://graph.facebook.com/" + userId + "/picture?width=144&height=144";
            fetchAndSetRoundedImage(url, picture, R.drawable.ic_person);
            name.setText(user[USER_NAME] + " " + user[USER_LASTNAME]);
            return view;
        }

        public String getUserId(int position) {
            String[] user = getUser(position);
            return user[USER_ID];
        }

        public String getUserName(int position) {
            String[] user = getUser(position);
            return user[USER_NAME] + " " + user[USER_LASTNAME];
        }

        private String[] getUser(int position) {
            JSONArray content = getRemoteContent();
            try {
                JSONObject json = content.getJSONObject(position);

                String[] user = new String[RESPONSE_SIZE];

                user[USER_ID] = json.getString("UserId");
                user[USER_NAME] = json.getString("FbName");
                user[USER_LASTNAME] = json.getString("FbLastName");

                return user;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

    private static class FriendsFetcher extends RemoteContentFetcher {
        private Context context;

        public FriendsFetcher(Context context) {
            super();
            this.context = context;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            HttpPost post = new HttpPost("http://api.descubrenear.com/" + userId + "/GetFriends");

            String userFriends = Preferences.getUserFacebookFriends(context);
            String body = "{\"friend_list\":[" + userFriends + "]}";
            StringEntity entity = new StringEntity(body);
            entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
            post.setHeader(new BasicHeader("Content-Type", "application/json"));
            post.setEntity(entity);

            HttpResponse response = client.execute(post);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
