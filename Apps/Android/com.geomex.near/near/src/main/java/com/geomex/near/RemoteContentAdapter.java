package com.geomex.near;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Path;
import android.graphics.Rect;
import android.os.AsyncTask;
import android.os.Build;
import android.support.v4.util.LruCache;
import android.widget.BaseAdapter;
import android.widget.ImageView;

import org.json.JSONArray;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * Created by adriangarcia on 03/03/14.
 */
public abstract class RemoteContentAdapter extends BaseAdapter {

    private JSONArray content;
    private LruCache<String, Bitmap> imageCache;
    private Map<String, AsyncTask> pendingTasks;

    public RemoteContentAdapter() {
        super();
        // Get max available VM memory, exceeding this amount will throw an
        // OutOfMemory exception. Stored in kilobytes as LruCache takes an
        // int in its constructor.
        final int maxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024);

        // Use 1/4th of the available memory for this memory cache.
        final int cacheSize = maxMemory / 4;

        imageCache = new LruCache<String, Bitmap>(cacheSize) {
            @Override
            protected int sizeOf(String key, Bitmap bitmap) {
                // The cache size will be measured in kilobytes rather than
                // number of items.
                return bitmap.getRowBytes() * bitmap.getHeight() / 1024;
            }
        };
        pendingTasks = new HashMap<String, AsyncTask>();
    }

    @Override
    public int getCount() {
        if (content == null) return 0;
        return content.length();
    }

    public void changeRemoteContent(JSONArray content) {
        this.content = content;
        notifyDataSetChanged();
    }

    public void cancelPendingTasks() {
        Set downloads = pendingTasks.entrySet();
        Iterator it = downloads.iterator();

        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            AsyncTask task = (AsyncTask) entry.getValue();
            task.cancel(true);
        }
        pendingTasks.clear();
    }

    protected JSONArray getRemoteContent() {
        return content;
    }

    protected void fetchAndSetImage(final String url, final ImageView imageView,
                                    int placeholderResId) {
        if (pendingTasks.containsKey(url)) {
            imageView.setImageResource(placeholderResId);
            return;
        }

        if (imageCache.get(url) == null) {
            RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
                @Override
                public void onRemoteImageFetched(Bitmap image) {
                    if (image != null) {
                        imageView.setImageBitmap(image);
                        imageCache.put(url, image);
                    }
                    pendingTasks.remove(url);
                    notifyDataSetChanged();
                }
            };
            RemoteImageFetcher imageFetcher = new RemoteImageFetcher(url);
            imageFetcher.setCallbacks(callbacks);
            if (Build.VERSION.SDK_INT >= 11) {
                imageFetcher.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            } else {
                imageFetcher.execute();
            }
            pendingTasks.put(url, imageFetcher);
            imageView.setImageResource(placeholderResId);
        } else {
            Bitmap image = imageCache.get(url);
            imageView.setImageBitmap(image);
        }
    }

    protected void fetchAndSetRoundedImage(final String url, final ImageView imageView,
                                           int placeholderResId) {
        if (pendingTasks.containsKey(url)) {
            imageView.setImageResource(placeholderResId);
            return;
        }

        if (imageCache.get(url) == null) {
            RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
                @Override
                public void onRemoteImageFetched(Bitmap image) {
                    if (image != null) {
                        Bitmap clippedImage = cropCircleImage(image);
                        imageView.setImageBitmap(clippedImage);
                        imageCache.put(url, clippedImage);
                    }
                    pendingTasks.remove(url);
                    notifyDataSetChanged();
                }
            };
            RemoteImageFetcher imageFetcher = new RemoteImageFetcher(url);
            imageFetcher.setCallbacks(callbacks);
            if (Build.VERSION.SDK_INT >= 11) {
                imageFetcher.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
            } else {
                imageFetcher.execute();
            }
            pendingTasks.put(url, imageFetcher);
            imageView.setImageResource(placeholderResId);
        } else {
            Bitmap image = imageCache.get(url);
            imageView.setImageBitmap(image);
        }
    }

    private Bitmap cropCircleImage(Bitmap image) {
        int width = image.getWidth();
        int height = image.getHeight();

        Bitmap clippedImage = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(clippedImage);
        Path path = new Path();

        path.addCircle(width / 2, height / 2, width / 2, Path.Direction.CCW);
        canvas.clipPath(path);
        canvas.drawBitmap(image,
                new Rect(0, 0, width, height),
                new Rect(0, 0, width, height),
                null);
        return clippedImage;
    }

}
