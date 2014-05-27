package com.geomex.near;

import android.content.Context;
import android.os.AsyncTask;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.protocol.HTTP;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

/**
 * Created by adriangarcia on 29/04/14.
 */

public class AppEventSender extends AsyncTask<Void, Void, Void> {

    public static final int EVENT_APP_OPEN = 0;
    public static final int EVENT_APP_CLOSE = 1;

    private static final String[] appEvents = {
        "OpenedApp",
        "ClosedApp"
    };
    private Context context;
    private int event;

    public AppEventSender(Context context, int event) {
        super();
        this.context = context;
        this.event = event;
    }

    @Override
    protected Void doInBackground(Void... voids) {
        String userId = Preferences.getUserFacebookId(context);
        if (userId == null) return null;

        HttpClient client = new DefaultHttpClient();
        HttpPost post = new HttpPost("http://near.noip.me/" + userId + "/AppEvent");
        double latitude = Preferences.getUserLocationLatitude(context);
        double longitude = Preferences.getUserLocationLongitude(context);

        try {
            JSONObject json = new JSONObject();
            json.put("event", appEvents[event]);
            json.put("latitude", latitude);
            json.put("longitude", longitude);

            String body = json.toString();
            StringEntity entity = new StringEntity(body, HTTP.UTF_8);
            entity.setContentEncoding(new BasicHeader("Content-Type", "application/json"));
            post.setHeader(new BasicHeader("Content-Type", "application/json"));
            post.setEntity(entity);
            client.execute(post);
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

}
