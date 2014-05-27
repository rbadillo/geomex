package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.Rect;
import android.os.Bundle;
import android.support.v4.app.ActionBarDrawerToggle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RadioButton;
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
 * Created by adriangarcia on 01/03/14.
 */
public class DrawerFragment extends Fragment {

    private static final String STATE_ACTIONBAR_TITLE = "actionbar_title";

    private static final String TAG_CLIENTS_FRAGMENT = "clients_fragment";
    private static final String TAG_INBOX_FRAGMENT = "inbox_fragment";
    private static final String TAG_FRIENDS_FRAGMENT = "friends_fragment";
    private static final String TAG_MAPS_FRAGMENT = "maps_fragment";
    private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

    private DrawerLayout drawerLayout;
    private ActionBarDrawerToggle drawerToggle;
    private ViewGroup userHistory;
    private ImageView userPicture;
    private TextView userName;
    private RadioButton clients;
    private RadioButton inbox;
    private RadioButton friends;
    private RadioButton maps;

    private CharSequence drawerTitle;
    private CharSequence title;

    private boolean userPictureSet = false;
    private boolean userNameSet = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_drawer, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        drawerTitle = getActivity().getTitle();
        drawerLayout = (DrawerLayout) view.findViewById(R.id.drawer_layout);
        ActionBarActivity activity = (ActionBarActivity) getActivity();
        final ActionBar actionBar = activity.getSupportActionBar();
        drawerToggle = new ActionBarDrawerToggle(getActivity(),
                drawerLayout,
                R.drawable.ic_drawer,
                R.string.drawer_open,
                R.string.drawer_close) {
            @Override
            public void onDrawerOpened(View drawerView) {
                super.onDrawerOpened(drawerView);

                actionBar.setTitle(drawerTitle);
                if (!userPictureSet) {
                    fetchAndSetUserPicture();
                }
                if (!userNameSet) {
                    fetchAndSetUserName();
                }
            }

            @Override
            public void onDrawerClosed(View drawerView) {
                super.onDrawerClosed(drawerView);
                actionBar.setTitle(title);
            }
        };
        drawerToggle.setDrawerIndicatorEnabled(false);

        drawerLayout.setDrawerListener(drawerToggle);
        drawerLayout.setDrawerShadow(R.drawable.drawer_shadow, Gravity.LEFT);
        actionBar.setHomeButtonEnabled(true);
        ((ImageView) activity.findViewById(android.R.id.home)).setImageResource(R.drawable.ic_drawer);

        userHistory = (ViewGroup) view.findViewById(R.id.navigation_user_history);
        userPicture = (ImageView) view.findViewById(R.id.user_picture);
        userName = (TextView) view.findViewById(R.id.user_name);
        clients = (RadioButton) view.findViewById(R.id.navigation_clients);
        inbox = (RadioButton) view.findViewById(R.id.navigation_inbox);
        friends = (RadioButton) view.findViewById(R.id.navigation_friends);
        maps = (RadioButton) view.findViewById(R.id.navigation_maps);

        View.OnClickListener userHistoryListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startUserHistoryActivity();
            }
        };
        View.OnClickListener clientsListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                presentClientsFragment();
            }
        };
        View.OnClickListener inboxListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                presentInboxFragment();
            }
        };
        View.OnClickListener friendsListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                presentFriendsFragment();
            }
        };
        View.OnClickListener mapsListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                presentMapsFragment();
            }
        };

        userHistory.setOnClickListener(userHistoryListener);
        clients.setOnClickListener(clientsListener);
        inbox.setOnClickListener(inboxListener);
        friends.setOnClickListener(friendsListener);
        maps.setOnClickListener(mapsListener);

        if (savedInstanceState == null) {
            title = "";
            actionBar.setTitle(title);
        } else {
            title = savedInstanceState.getCharSequence(STATE_ACTIONBAR_TITLE);
            actionBar.setTitle(title);
        }
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        drawerToggle.syncState();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        drawerToggle.onConfigurationChanged(newConfig);
    }

    @Override
    public void onStart() {
        super.onStart();

        if (!userPictureSet) {
            fetchAndSetUserPicture();
        }
        if (!userNameSet) {
            fetchAndSetUserName();
        }

        if (Preferences.getUserFacebookId(getActivity()) != null) {
            fetchAndSetUnreadMessageCount();
        }
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);

        ActionBarActivity activity = (ActionBarActivity) getActivity();
        ActionBar actionBar = activity.getSupportActionBar();
        outState.putCharSequence(STATE_ACTIONBAR_TITLE, actionBar.getTitle());
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            if (drawerLayout.isDrawerOpen(Gravity.LEFT)) {
                drawerLayout.closeDrawer(Gravity.LEFT);
            } else {
                drawerLayout.openDrawer(Gravity.LEFT);
            }
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    public void setCurrentFragment(int fragment) {
        switch (fragment) {
            case 0:
                clients.setChecked(true);
                presentClientsFragment();
                break;
            case 1:
                inbox.setChecked(true);
                presentInboxFragment();
                break;
            case 2:
                friends.setChecked(true);
                presentFriendsFragment();
                break;
            case 3:
                maps.setChecked(true);
                presentMapsFragment();
                break;
        }
        ActionBarActivity activity = (ActionBarActivity) getActivity();
        ActionBar actionBar = activity.getSupportActionBar();
        actionBar.setTitle(title);
        fetchAndSetUnreadMessageCount();
    }

    private void fetchAndSetUserPicture() {
        userPicture.setImageResource(R.drawable.ic_person_dark);
        String userId = Preferences.getUserFacebookId(getActivity());
        String url = "https://graph.facebook.com/" + userId + "/picture?width=144&height=144";
        RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
            @Override
            public void onRemoteImageFetched(Bitmap image) {
                if (image != null) {
                    userPicture.setImageBitmap(cropCircleImage(image));
                    userPictureSet = true;
                }
            }
        };
        RemoteImageFetcher imageFetcher = new RemoteImageFetcher(url);
        imageFetcher.setCallbacks(callbacks);
        imageFetcher.execute();
    }

    private void fetchAndSetUserName() {
        String userProfile = Preferences.getUserFacebookProfile(getActivity());
        if (userProfile == null) return;

        try {
            JSONObject json = new JSONObject(userProfile);
            String name = json.getString("name");

            if (name != null) {
                userName.setText(name);
                userNameSet = true;
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void fetchAndSetUnreadMessageCount() {
        final String navigationInbox = getResources().getString(R.string.navigation_inbox);
        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                if (content == null) return;

                try {
                    JSONObject json = content.getJSONObject(0);
                    int messageCount = json.getInt("State");

                    if (messageCount > 0) {
                        inbox.setText(navigationInbox + " (" + messageCount + ")");
                    } else {
                        inbox.setText(navigationInbox);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
        UnreadMessageCountFetcher unreadMessageCountFetcher = new UnreadMessageCountFetcher(getActivity());
        unreadMessageCountFetcher.setCallbacks(callbacks);
        unreadMessageCountFetcher.execute();
    }

    private Bitmap cropCircleImage(Bitmap image) {
        int width = image.getWidth();
        int height = image.getHeight();

        Bitmap clippedImage = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(clippedImage);
        Path path = new Path();

        path.addCircle(width / 2, height / 2, width / 2, Path.Direction.CCW);
        canvas.clipPath(path);
        canvas.drawBitmap(image,
                new Rect(0, 0, width, height),
                new Rect(0, 0, width, height),
                null);
        return clippedImage;
    }

    private void startUserHistoryActivity() {
        String userId = Preferences.getUserFacebookId(getActivity());
        String userProfile = Preferences.getUserFacebookProfile(getActivity());
        if (userId == null || userProfile == null) return;

        try {
            JSONObject json = new JSONObject(userProfile);
            String name = json.getString("name");

            if (name != null) {
                Intent intent = new Intent(getActivity(), UserOffersActivity.class);
                intent.putExtra(UserOffersActivity.EXTRA_USER_ID, userId);
                intent.putExtra(UserOffersActivity.EXTRA_USER_NAME, name);
                startActivity(intent);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        drawerLayout.closeDrawer(Gravity.LEFT);
    }

    private void presentClientsFragment() {
        title = "";

        FragmentManager fm = getChildFragmentManager();
        ClientsFragment fragment = (ClientsFragment) fm.findFragmentByTag(TAG_CLIENTS_FRAGMENT);
        if (fragment == null) {
            fragment = ClientsFragment.newInstance();
        }
        if (!fragment.isAdded()) {
            removeFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, TAG_CLIENTS_FRAGMENT)
                    .commit();
        }
        drawerLayout.closeDrawer(Gravity.LEFT);
    }

    private void presentInboxFragment() {
        title = getResources().getString(R.string.navigation_inbox);

        FragmentManager fm = getChildFragmentManager();
        InboxFragment fragment = (InboxFragment) fm.findFragmentByTag(TAG_INBOX_FRAGMENT);
        if (fragment == null) {
            fragment = InboxFragment.newInstance();
        }
        if (!fragment.isAdded()) {
            removeFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, TAG_INBOX_FRAGMENT)
                    .commit();
        }
        drawerLayout.closeDrawer(Gravity.LEFT);
    }

    private void presentFriendsFragment() {
        title = getResources().getString(R.string.navigation_friends);

        FragmentManager fm = getChildFragmentManager();
        FriendsFragment fragment = (FriendsFragment) fm.findFragmentByTag(TAG_FRIENDS_FRAGMENT);
        if (fragment == null) {
            fragment = FriendsFragment.newInstance();
        }
        if (!fragment.isAdded()) {
            removeFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, TAG_FRIENDS_FRAGMENT)
                    .commit();
        }
        drawerLayout.closeDrawer(Gravity.LEFT);
    }

    private void presentMapsFragment() {
        title = getResources().getString(R.string.navigation_maps);

        FragmentManager fm = getChildFragmentManager();
        MapsFragment fragment = (MapsFragment) fm.findFragmentByTag(TAG_MAPS_FRAGMENT);
        if (fragment == null) {
            fragment = MapsFragment.newInstance();
        }
        if (!fragment.isAdded()) {
            removeFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, TAG_MAPS_FRAGMENT)
                    .commit();
        }
        drawerLayout.closeDrawer(Gravity.LEFT);
    }

    private void removeFragments() {
        FragmentManager fm = getChildFragmentManager();
        Fragment clients = fm.findFragmentByTag(TAG_CLIENTS_FRAGMENT);
        Fragment inbox = fm.findFragmentByTag(TAG_INBOX_FRAGMENT);
        Fragment friends = fm.findFragmentByTag(TAG_FRIENDS_FRAGMENT);
        Fragment maps = fm.findFragmentByTag(TAG_MAPS_FRAGMENT);
        Fragment error = fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

        FragmentTransaction transaction = fm.beginTransaction();
        if (clients != null) {
            transaction.remove(clients);
        }
        if (inbox != null) {
            transaction.remove(inbox);
        }
        if (friends != null) {
            transaction.remove(friends);
        }
        if (maps != null) {
            transaction.remove(maps);
        }
        if (error != null) {
            transaction.remove(error);
        }
        transaction.commit();
    }

    private static class UnreadMessageCountFetcher extends RemoteContentFetcher {
        private Context context;

        public UnreadMessageCountFetcher(Context context) {
            super();
            this.context = context;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            HttpGet get = new HttpGet("http://near.noip.me/" + userId +
                                      "/" + userTimeZone + "/GetUnreadMessages");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

}
