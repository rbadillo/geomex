package com.geomex.near;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * Created by adriangarcia on 03/03/14.
 */
public class RemoteImageFetcher extends AsyncTask<Void, Void, Bitmap> {

    private String url;
    private Callbacks callbacks;

    public RemoteImageFetcher(String url) {
        super();
        this.url = url;
    }

    @Override
    protected Bitmap doInBackground(Void... params) {
        if (isCancelled()) return null;

        try {
            return fetchRemoteImage();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    protected void onPostExecute(Bitmap bitmap) {
        super.onPostExecute(bitmap);

        if (callbacks != null) {
            callbacks.onRemoteImageFetched(bitmap);
        }
    }

    public void setCallbacks(Callbacks callbacks) {
        this.callbacks = callbacks;
    }

    private Bitmap fetchRemoteImage() throws IOException {
        URL url = new URL(this.url);
        InputStream inputStream = url.openStream();
        return BitmapFactory.decodeStream(inputStream);
    }

    public interface Callbacks {
        public void onRemoteImageFetched(Bitmap image);
    }

}
