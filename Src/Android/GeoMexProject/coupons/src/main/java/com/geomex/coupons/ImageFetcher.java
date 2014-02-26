package com.geomex.coupons;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * Created by adriangarcia on 16/12/13.
 */
public class ImageFetcher extends AsyncTask<Void, Void, Bitmap> {

    private String mUrl;
    OnImageFetchedListener mListener;

    public ImageFetcher(String url, OnImageFetchedListener listener) {
        super();
        mUrl = url;
        mListener = listener;
    }

    @Override
    protected Bitmap doInBackground(Void... params) {
        if (isCancelled()) {
            return null;
        }

        try {
            InputStream stream = new URL(mUrl).openStream();
            return BitmapFactory.decodeStream(stream);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    protected void onPostExecute(Bitmap bitmap) {
        super.onPostExecute(bitmap);
        if (mListener != null) {
            mListener.onImageFetched(bitmap);
        }
    }

    public interface OnImageFetchedListener {
        public void onImageFetched(Bitmap bitmap);
    }

    public void setOnImageFetchedListener(OnImageFetchedListener listener) {
        mListener = listener;
    }
}
