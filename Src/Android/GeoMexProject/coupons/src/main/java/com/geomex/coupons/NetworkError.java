package com.geomex.coupons;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

/**
 * Created by adriangarcia on 12/02/14.
 */
public class NetworkError extends Fragment {

    private Button mNewAttempt;
    private NetworkErrorHandler mHandler;

    public NetworkError() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_error, container, false);
        return rootView;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        mNewAttempt = (Button) view.findViewById(R.id.new_attempt);
        mNewAttempt.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                requestNewAttempt();
            }
        });
    }

    private void requestNewAttempt() {
        if (mHandler != null) {
            mHandler.onRequestNewAttempt();
        }
    }

    public void setNetworkErrorHandler(NetworkErrorHandler handler) {
        mHandler = handler;
    }

    public interface NetworkErrorHandler {

        public void onRequestNewAttempt();
    }
}
