package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.LayoutInflater;
import android.view.MenuItem;
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
 * Created by adriangarcia on 11/01/14.
 */
public class ClientCouponsActivity extends ActionBarActivity {

    public static final String CLIENT_ID_KEY = "clientId";
    public static final String CLIENT_NAME_KEY = "clientName";

    private ListView mList;
    private ProgressBar mProgress;
    private TextView mEmpty;

    private ContentAdapter mContentAdapter;
    private AsyncTask mContentDownload;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.fragment_coupons);

        mList = (ListView) findViewById(R.id.list);
        mProgress = (ProgressBar) findViewById(R.id.progress);
        mEmpty = (TextView) findViewById(R.id.empty);

        mContentAdapter = new MyContentAdapter(this, null);
        mList.setAdapter(mContentAdapter);
        mList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(ClientCouponsActivity.this, CouponActivity.class);
                intent.putExtra(CouponActivity.COUPON_ID_KEY, mContentAdapter.getItemIdAsString(position));
                intent.putExtra(CouponActivity.COUPON_TITLE_KEY, mContentAdapter.getItemName(position));
                startActivity(intent);
            }
        });

        String title = getResources().getString(R.string.activity_client_coupons);
        getSupportActionBar().setTitle(getClientName() + title);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    }

    @Override
    protected void onStart() {
        super.onStart();
        refreshContent();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mContentAdapter.cancelAllDownloads();
        if (mContentDownload != null) {
            mContentDownload.cancel(true);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == android.R.id.home) {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private String getClientId() {
        return getIntent().getStringExtra(CLIENT_ID_KEY);
    }

    private String getClientName() {
        return getIntent().getStringExtra(CLIENT_NAME_KEY);
    }

    private void refreshContent() {
        mContentDownload = new MyContentFetcher(this, new ContentFetcher.OnContentFetchedListener() {
            @Override
            public void onContentFetched(JSONArray content) {
                mContentAdapter.setContent(content);
                mContentAdapter.notifyDataSetChanged();

                mProgress.setVisibility(View.GONE);
                if (content != null && content.length() == 0) {
                    mEmpty.setVisibility(View.VISIBLE);
                } else {
                    mEmpty.setVisibility(View.GONE);
                }
                mContentDownload = null;
            }
        }, getClientId()).execute();
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

        private String mClientId;

        public MyContentFetcher(Context context, OnContentFetchedListener listener, String clientId) {
            super(context, null, listener);
            setContentFetcherHelper(this);
            mClientId = clientId;
        }

        @Override
        public JSONArray fetchContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            HttpGet get = new HttpGet(
                    "http://geomex-gimbal.no-ip.org:5000/"
                    + getUserId() + "/"
                    + getTimeZone() + "/GetOffers?client_id="
                    + mClientId);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }
}
