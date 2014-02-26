package com.geomex.coupons;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.preference.PreferenceManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.TimeZone;

/**
 * Created by adriangarcia on 13/01/14.
 */
public class ContentFetcher extends AsyncTask<Void, Void, JSONArray> {

    private Context mContext;
    private ContentFetcherHelper mHelper;
    private OnContentFetchedListener mListener;

    public ContentFetcher(Context context, ContentFetcherHelper helper, OnContentFetchedListener listener) {
        super();
        mContext = context;
        mHelper = helper;
        mListener = listener;
    }

    @Override
    protected JSONArray doInBackground(Void... params) {
        if (isCancelled()) {
            return null;
        }

        try {
            if (mHelper != null) {
                return mHelper.fetchContent();
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    protected void onPostExecute(JSONArray jsonArray) {
        super.onPostExecute(jsonArray);
        if (mListener != null) {
            mListener.onContentFetched(jsonArray);
        }
    }

    protected String getUserId() {
        try {
            String userData = readUserData();
            JSONObject json = new JSONObject(userData);

            return json.getString("id");
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    protected String getTimeZone() {
        long timeOffset = TimeZone.getDefault().getRawOffset()/1000/60/60;
        String timeZone = "";
        if (timeOffset < 0) {
            timeZone = String.format("%03d00", timeOffset);
        } else {
            timeZone = String.format("+%02d00", timeOffset);
        }
        return timeZone;
    }

    protected String getUserData(int locationId, String eventType) throws JSONException, IOException {
        String userData = readUserData();
        JSONObject json = new JSONObject(userData);

        json.put("device_token", getRegistrationId());
        json.put("phone_type", "Android");
        json.put("location_id", locationId);
        json.put("event", eventType);
        json.put("latitude", getLatitude());
        json.put("longitude", getLongitude());

        return json.toString();
    }

    protected double getLatitude() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(mContext);
        long lat = preferences.getLong(LocationClientManager.LAST_LOCATION_LATITUDE_PREF, 0);
        return Double.longBitsToDouble(lat);
    }

    protected double getLongitude() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(mContext);
        long lon = preferences.getLong(LocationClientManager.LAST_LOCATION_LONGITUDE_PREF, 0);
        return Double.longBitsToDouble(lon);
    }

    private String readUserData() throws IOException {
        FileInputStream fis = mContext.openFileInput(GeomexService.USER_DATA_FILE);
        int fileSize = (int) fis.getChannel().size();
        byte[] data = new byte[fileSize];

        fis.read(data);
        fis.close();

        return new String(data);
    }

    private String getRegistrationId() {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(mContext);
        return preferences.getString(MainActivity.REGISTRATION_ID_PREF, "");
    }

    public interface ContentFetcherHelper {
        public JSONArray fetchContent() throws IOException, JSONException;
    }

    public interface OnContentFetchedListener {
        public void onContentFetched(JSONArray content);
    }

    public void setContentFetcherHelper(ContentFetcherHelper helper) {
        mHelper = helper;
    }
}
