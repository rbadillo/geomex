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
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Created by adriangarcia on 22/12/13.
 */
public class ContentCoupons extends Fragment {

    private static final String NET_ERROR_TAG = "networkError";

    private ListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ContentAdapter mContentAdapter;

    private AsyncTask mContentDownload;

    public ContentCoupons() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_coupons, container, false);
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
                Intent intent = new Intent(getActivity(), CouponActivity.class);
                intent.putExtra(CouponActivity.COUPON_ID_KEY, mContentAdapter.getItemIdAsString(position));
                intent.putExtra(CouponActivity.COUPON_TITLE_KEY, mContentAdapter.getItemName(position));
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
                        .show(ContentCoupons.this)
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
                            .show(ContentCoupons.this)
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

        private static final int OFFER_ID = 0;
        private static final int PRIMARY_TEXT = 1;
        private static final int SECONDARY_TEXT = 2;
        private static final int CLIENT_NAME = 3;
        private static final int CLIENT_LOGO = 4;
        private static final int PRIMARY_IMAGE = 5;
        private static final int START_DATE = 6;
        private static final int END_DATE = 7;
        private static final int TOTAL_REDEMPTION = 8;
        private static final int ACTUAL_REDEMPTION = 9;

        public MyContentAdapter(Context context, JSONArray content) {
            super(context, content);
            ITEM_ID = OFFER_ID;
            ITEM_NAME = PRIMARY_TEXT;
            ITEM_SIZE = 10;
        }

        @Override
        protected String[] getItemAsStringArray(int position) {
            try {
                JSONObject json = mContent.getJSONObject(position);
                String[] item = new String[ITEM_SIZE];

                item[OFFER_ID] = json.getString("OfferId");
                item[PRIMARY_TEXT] = json.getString("Title");
                item[SECONDARY_TEXT] = json.getString("Subtitle");
                item[CLIENT_NAME] = json.getString("ClientName");
                item[CLIENT_LOGO] = json.getString("Logo");
                item[PRIMARY_IMAGE] = json.getString("PrimaryImage");
                item[START_DATE] = json.getString("StartDate");
                item[END_DATE] = json.getString("EndDate");
                item[TOTAL_REDEMPTION] = json.getString("TotalRedemption");
                item[ACTUAL_REDEMPTION] = json.getString("ActualRedemption");

                return item;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View viewItem = inflater.inflate(R.layout.content_coupons_list_item, parent, false);
            ImageView image = (ImageView) viewItem.findViewById(R.id.secondary_image);
            ImageView logo = (ImageView) viewItem.findViewById(R.id.logo);
            TextView title = (TextView) viewItem.findViewById(R.id.title);
            TextView subtitle = (TextView) viewItem.findViewById(R.id.subtitle);
            TextView endDate = (TextView) viewItem.findViewById(R.id.end_date);
            TextView name = (TextView) viewItem.findViewById(R.id.client_name);

            String[] item = getItemAsStringArray(position);
            fetchImage(image, item[OFFER_ID], item[PRIMARY_IMAGE], -1);
            fetchImage(logo, item[CLIENT_NAME], item[CLIENT_LOGO], R.drawable.ic_picture);
            title.setText(item[PRIMARY_TEXT]);
            subtitle.setText(item[SECONDARY_TEXT]);

            if (couponIsAvailable(position)) {
                String endsOn = mContext.getResources().getString(R.string.content_coupons_endsOn);
                endDate.setText(endsOn + " " + getDisplayDate(item[END_DATE]));
            } else {
                String comingSoon = mContext.getResources().getString(R.string.content_coupons_comingSoon);
                endDate.setText(comingSoon);
            }

            name.setText(item[CLIENT_NAME]);
            return viewItem;
        }

        private boolean couponIsAvailable(int position) {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("UTC"));

            try {
                String item[] = getItemAsStringArray(position);
                Calendar cal = Calendar.getInstance();
                Date now = cal.getTime();
                Date startDate = format.parse(item[START_DATE]);

                if (startDate.after(now)) {
                    return false;
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return true;
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
            HttpGet get = new HttpGet("http://geomex-gimbal.no-ip.org:5000/"
                    + getUserId() + "/"
                    + getTimeZone() + "/GetOffers");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
