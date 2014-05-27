package com.geomex.near;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.facebook.Session;
import com.facebook.SessionState;
import com.facebook.UiLifecycleHelper;
import com.facebook.widget.LoginButton;

import java.util.ArrayList;

/**
 * Created by adriangarcia on 01/03/14.
 */
public class UserLoginFragment extends Fragment {

    private UiLifecycleHelper uiHelper;
    private Callbacks callbacks;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Session.StatusCallback statusCallback = new Session.StatusCallback() {
            @Override
            public void call(Session session, SessionState state, Exception exception) {
                if (callbacks == null) return;

                if (state.isOpened()) {
                    callbacks.onSessionIsOpened();
                } else if (state.isClosed()) {
                    callbacks.onSessionIsClosed();
                }
            }
        };
        uiHelper = new UiLifecycleHelper(getActivity(), statusCallback);
        uiHelper.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_user_login, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        View.OnClickListener websiteListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startAppWebsiteActivity();
            }
        };
        TextView website = (TextView) view.findViewById(R.id.app_website);
        website.setOnClickListener(websiteListener);

        ArrayList<String> permissions = new ArrayList<String>();
        permissions.add("email");
        permissions.add("user_birthday");
        permissions.add("user_education_history");
        permissions.add("user_work_history");

        LoginButton login = (LoginButton) view.findViewById(R.id.action_login);
        login.setFragment(this);
        login.setReadPermissions(permissions);
    }

    @Override
    public void onResume() {
        super.onResume();
        uiHelper.onResume();
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        uiHelper.onSaveInstanceState(outState);
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
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        uiHelper.onActivityResult(requestCode, resultCode, data);
    }

    public void setCallbacks(Callbacks callbacks) {
        this.callbacks = callbacks;
    }

    private void startAppWebsiteActivity() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        String url = getResources().getString(R.string.app_website_full);
        intent.setData(Uri.parse(url));
        startActivity(intent);
    }

    public interface Callbacks {
        public void onSessionIsOpened();

        public void onSessionIsClosed();
    }

}
