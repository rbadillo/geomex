package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.Request;
import com.facebook.Response;
import com.facebook.Session;
import com.facebook.SessionState;
import com.facebook.UiLifecycleHelper;
import com.facebook.model.GraphUser;
import com.facebook.widget.LoginButton;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;

/**
 * Created by adriangarcia on 14/12/13.
 */
public class PlaceholderFragment extends Fragment {

    public static final String USER_LOGIN_PREF = "user_login";

    private static final String DRAWER_TAG = "drawer";

    private LoginButton authButton;
    private UiLifecycleHelper uiHelper;
    private Session.StatusCallback callback = new Session.StatusCallback() {
        @Override
        public void call(Session session, SessionState state, Exception exception) {
            onSessionStateChange(session, state, exception);
        }
    };

    public PlaceholderFragment() {}

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        uiHelper = new UiLifecycleHelper(getActivity(), callback);
        uiHelper.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_main, container, false);
        authButton = (LoginButton) rootView.findViewById(R.id.authButton);
        authButton.setReadPermissions(Arrays.asList(
                "email",
                "user_birthday",
                "user_education_history",
                "user_work_history"));
        authButton.setFragment(this);

        if (savedInstanceState != null) {
            Session session = Session.getActiveSession();
            ActionBar actionBar = ((ActionBarActivity) getActivity()).getSupportActionBar();

            if (session != null && session.isOpened()) {
                FragmentManager fm = getFragmentManager();
                fm.beginTransaction()
                        .hide(this)
                        .commit();
                actionBar.show();
            }
        }
        return rootView;
    }

    @Override
    public void onResume() {
        super.onResume();
        Session session = Session.getActiveSession();
        if (session != null &&
                (session.isOpened() || session.isClosed()) ) {
            onSessionStateChange(session, session.getState(), null);
        }
        uiHelper.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();
        uiHelper.onPause();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        uiHelper.onDestroy();
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        uiHelper.onSaveInstanceState(outState);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        uiHelper.onActivityResult(requestCode, resultCode, data);
    }

    private void onSessionStateChange(Session session, SessionState state, Exception exception) {
        if (state.isOpened()) {
            onSessionStateOpen();
        } else if (state.isClosed()) {
            onSessionStateClose();
        }
    }

    private void onSessionStateOpen() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getActivity());
        SharedPreferences.Editor editor = preferences.edit();
        editor.putBoolean(USER_LOGIN_PREF, true);
        editor.commit();

        FragmentManager fm = getFragmentManager();
        DrawerFragment fragment = (DrawerFragment) fm.findFragmentByTag(DRAWER_TAG);
        ActionBar actionBar = ((ActionBarActivity) getActivity()).getSupportActionBar();

        if (fragment == null) {
            fragment = new DrawerFragment();
        }
        if (!fragment.isAdded()) {
            actionBar.show();
            fm.beginTransaction()
                    .hide(this)
                    .add(R.id.container, fragment, DRAWER_TAG)
                    .commit();
        }

        fetchUserData();
        registerUser();
        startGeomexService();
    }

    private void onSessionStateClose() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getActivity());
        SharedPreferences.Editor editor = preferences.edit();
        editor.putBoolean(USER_LOGIN_PREF, false);
        editor.commit();

        FragmentManager fm = getFragmentManager();
        DrawerFragment fragment = (DrawerFragment) fm.findFragmentByTag(DRAWER_TAG);
        ActionBar actionBar = ((ActionBarActivity) getActivity()).getSupportActionBar();

        if (fragment != null && fragment.isAdded()) {
            actionBar.setTitle(R.string.app_name);
            actionBar.hide();
            fm.beginTransaction()
                    .show(this)
                    .remove(fragment)
                    .commit();
        }
    }

    private void fetchUserData() {
        Request.newMeRequest(Session.getActiveSession(), new Request.GraphUserCallback() {
            @Override
            public void onCompleted(GraphUser user, Response response) {
                if (user == null) {
                    return;
                }

                JSONObject json = user.getInnerJSONObject();
                String userData = json.toString();

                try {
                    storeUserData(userData);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).executeAsync();
    }

    private void storeUserData(String data) throws IOException {
        if (getActivity() == null) {
            return;
        }

        FileOutputStream fos = getActivity().openFileOutput(
                GeomexService.USER_DATA_FILE, Context.MODE_PRIVATE);
        fos.write(data.getBytes());
        fos.close();
    }

    private void registerUser() {
        new RegisterUser(getActivity()).execute();
    }

    private void startGeomexService() {
        Intent geomexServiceIntent = new Intent(getActivity(), GeomexService.class);
        geomexServiceIntent.setAction("com.geomex.coupons.GEOMEX_SERVICE");

        getActivity().startService(geomexServiceIntent);
    }

    private static class RegisterUser extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        public RegisterUser(Context context) {
            super(context, null, null);
            setContentFetcherHelper(this);
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpPost post = new HttpPost("http://geomex-gimbal.no-ip.org:8000/Register");
            String userData = getUserData(-1, "OpenedApp");
            StringEntity entity = new StringEntity(userData);

            entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
            post.setHeader(new BasicHeader("Content-Type", "application/json"));
            post.setEntity(entity);
            client.execute(post);
            return null;
        }
    }
}
