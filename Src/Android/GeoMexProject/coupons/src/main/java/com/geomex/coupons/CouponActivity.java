package com.geomex.coupons;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
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
 * Created by adriangarcia on 30/12/13.
 */
public class CouponActivity extends ActionBarActivity {

    public static final String COUPON_ID_KEY = "couponId";
    public static final String COUPON_TITLE_KEY = "couponTitle";

    private static final String REDEEM_TAG = "redeem";

    private ImageView mSecondaryImage;
    private TextView mTitle;
    private TextView mSubtitle;
    private Button mRedeem;
    private ProgressBar mProgress;
    private ImageView mLogo;
    private TextView mClientName;
    private TextView mDisclaimer;

    private AsyncTask mContentDownload;
    private AsyncTask mContentDownload2;
    private AsyncTask mContentDownload3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_coupon);

        mSecondaryImage = (ImageView) findViewById(R.id.secondary_image);
        mTitle = (TextView) findViewById(R.id.title);
        mSubtitle = (TextView) findViewById(R.id.subtitle);
        mRedeem = (Button) findViewById(R.id.redeem);
        mProgress = (ProgressBar) findViewById(R.id.progress);
        mLogo = (ImageView) findViewById(R.id.logo);
        mClientName = (TextView) findViewById(R.id.client_name);
        mDisclaimer = (TextView) findViewById(R.id.disclaimer);

        mTitle.setText(getCouponTitle());
        mRedeem.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                CouponRedeem.newInstance(getCouponId()).show(getSupportFragmentManager(), REDEEM_TAG);
            }
        });

        getSupportActionBar().setTitle(getCouponTitle());
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
        if (mContentDownload != null) {
            mContentDownload.cancel(true);
        }
        if (mContentDownload2 != null) {
            mContentDownload2.cancel(true);
        }
        if (mContentDownload3 != null) {
            mContentDownload3.cancel(true);
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

    private String getCouponId() {
        return getIntent().getStringExtra(COUPON_ID_KEY);
    }

    private String getCouponTitle() {
        return getIntent().getStringExtra(COUPON_TITLE_KEY);
    }

    private void refreshContent() {
        mContentDownload = new MyContentFetcher(this, new ContentFetcher.OnContentFetchedListener() {
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
        mSubtitle.setText(json.getString("Subtitle"));
        mClientName.setText(json.getString("ClientName"));
        mDisclaimer.setText(json.getString("Disclaimer"));

        fetchImages(json);

        if (couponIsAvailable(json.getString("StartDate"))) {
            mRedeem.setEnabled(true);
        } else {
            String text = getResources().getString(R.string.activity_coupon_comingSoon);
            mRedeem.setText(text);
        }
        mProgress.setVisibility(View.GONE);
    }

    private void fetchImages(JSONObject json) throws JSONException {
        mContentDownload2 = new ImageFetcher(json.getString("SecondaryImage"), new ImageFetcher.OnImageFetchedListener() {
            @Override
            public void onImageFetched(Bitmap bitmap) {
                mSecondaryImage.setImageBitmap(bitmap);
                mContentDownload2 = null;
            }
        }).execute();

        mContentDownload3 = new ImageFetcher(json.getString("Logo"), new ImageFetcher.OnImageFetchedListener() {
            @Override
            public void onImageFetched(Bitmap bitmap) {
                mLogo.setImageBitmap(bitmap);
                mContentDownload3 = null;
            }
        }).execute();
    }

    private boolean couponIsAvailable(String date) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));

        try {
            Calendar cal = Calendar.getInstance();
            Date now = cal.getTime();
            Date startDate = format.parse(date);

            if (startDate.after(now)) {
                return false;
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return true;
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
                    + mCouponId + "?latitude="
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
