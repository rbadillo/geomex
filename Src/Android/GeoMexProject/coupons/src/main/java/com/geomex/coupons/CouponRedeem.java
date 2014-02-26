package com.geomex.coupons;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.DialogFragment;
import android.view.LayoutInflater;
import android.view.View;
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
 * Created by adriangarcia on 31/12/13.
 */
public class CouponRedeem extends DialogFragment {

    public static final String COUPON_ID_KEY = "couponId";

    public static CouponRedeem newInstance(String id) {
        CouponRedeem fragment = new CouponRedeem();
        Bundle args = new Bundle();
        args.putString(COUPON_ID_KEY, id);
        fragment.setArguments(args);
        return fragment;
    }

    private TextView mInstructions;
    private TextView mCode;
    private ProgressBar mProgress;

    private AsyncTask mContentDownload;

    public CouponRedeem() {}

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        // Use the Builder class for convenient dialog construction
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        LayoutInflater inflater = getActivity().getLayoutInflater();
        View view = inflater.inflate(R.layout.fragment_redeem, null, false);

        mInstructions = (TextView) view.findViewById(R.id.instructions);
        mCode = (TextView) view.findViewById(R.id.code);
        mProgress = (ProgressBar) view.findViewById(R.id.progress);

        builder.setTitle(R.string.coupon_redeem)
                .setView(view)
                .setPositiveButton(R.string.coupon_redeem_done, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        Intent intent = new Intent(getActivity(), MainActivity.class);
                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        startActivity(intent);
                        dismiss();
                    }
                });
        // Create the AlertDialog object and return it
        return builder.create();
    }

    @Override
    public void onStart() {
        super.onStart();
        refreshContent();
    }

    @Override
    public void onStop() {
        super.onStop();
        if (mContentDownload != null) {
            mContentDownload.cancel(true);
        }
    }

    private String getCouponId() {
        Bundle args = getArguments();
        if (args != null) {
            return args.getString(COUPON_ID_KEY);
        }
        return null;
    }

    private void refreshContent() {
        mContentDownload = new MyContentFetcher(getActivity(), new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                try {
                    showCouponInfo(content);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                mContentDownload = null;
            }
        }, getCouponId()).execute();
    }

    private void showCouponInfo(JSONArray content) throws JSONException {
        if (content == null) {
            return;
        }

        JSONObject json = content.getJSONObject(0);
        mInstructions.setText(json.getString("Instructions"));
        mCode.setText(json.getString("Code"));
        mProgress.setVisibility(View.GONE);
    }

    private static class MyContentFetcher extends ContentFetcher implements ContentFetcher.ContentFetcherHelper {

        private String mCouponId;

        public MyContentFetcher(Context context, OnContentFetchedListener listener, String couponId) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mCouponId = couponId;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet(
                    "http://geomex-gimbal.no-ip.org:5000/"
                    + getUserId() + "/"
                    + getTimeZone() + "/GetOffers/"
                    + mCouponId + "/Redeem?latitude="
                    + getLatitude() + "&longitude="
                    + getLongitude());

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
