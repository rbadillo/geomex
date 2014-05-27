package com.geomex.near;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

/**
 * Created by adriangarcia on 04/04/14.
 */
public class NetworkErrorFragment extends Fragment {

    private Callbacks callbacks;

    public static NetworkErrorFragment newInstance() {
        NetworkErrorFragment fragment = new NetworkErrorFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_network_error, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Button retry = (Button) view.findViewById(R.id.action_retry);
        View.OnClickListener listener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (callbacks != null) {
                    callbacks.onActionRetry();
                }
            }
        };
        retry.setOnClickListener(listener);
    }

    public void setCallbacks(Callbacks callbacks) {
        this.callbacks = callbacks;
    }

    public interface Callbacks {
        public void onActionRetry();
    }

}
