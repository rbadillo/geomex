package com.geomex.near;

import android.os.AsyncTask;

import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;

/**
 * Created by adriangarcia on 03/03/14.
 */
public abstract class RemoteContentFetcher extends AsyncTask<Void, Void, JSONArray> {

    private Callbacks callbacks;

    @Override
    protected JSONArray doInBackground(Void... params) {
        if (isCancelled()) return null;

        try {
            return fetchRemoteContent();
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

        if (callbacks != null) {
            callbacks.onRemoteContentFetched(jsonArray);
        }
    }

    public void setCallbacks(Callbacks callbacks) {
        this.callbacks = callbacks;
    }

    protected abstract JSONArray fetchRemoteContent() throws IOException, JSONException;

    public interface Callbacks {
        public void onRemoteContentFetched(JSONArray content);
    }

}
