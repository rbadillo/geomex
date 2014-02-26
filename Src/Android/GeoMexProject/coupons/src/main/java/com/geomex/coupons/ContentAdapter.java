package com.geomex.coupons;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.support.v4.util.LruCache;
import android.widget.BaseAdapter;
import android.widget.ImageView;

import org.json.JSONArray;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;

/**
 * Created by adriangarcia on 14/01/14.
 */
public abstract class ContentAdapter extends BaseAdapter {

    protected int ITEM_ID;
    protected int ITEM_NAME;
    protected int ITEM_SIZE;

    protected Context mContext;
    protected JSONArray mContent;

    protected LruCache<String, Bitmap> mMemoryCache;

    private Map<String, AsyncTask> mContentDownloads;

    public ContentAdapter(Context context, JSONArray content) {
        super();
        mContext = context;
        mContent = content;

        // Get max available VM memory, exceeding this amount will throw an
        // OutOfMemory exception. Stored in kilobytes as LruCache takes an
        // int in its constructor.
        final int maxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024);

        // Use 1/8th of the available memory for this memory cache.
        final int cacheSize = maxMemory / 8;

        mMemoryCache = new LruCache<String, Bitmap>(cacheSize) {
            @Override
            protected int sizeOf(String key, Bitmap bitmap) {
                // The cache size will be measured in kilobytes rather than
                // number of items.
                return bitmap.getRowBytes() * bitmap.getHeight() / 1024;
            }
        };

        mContentDownloads = new HashMap<String, AsyncTask>();
    }

    @Override
    public int getCount() {
        if (mContent == null) {
            return 0;
        }
        return mContent.length();
    }

    @Override
    public Object getItem(int position) {
        return null;
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    public String getItemIdAsString(int position) {
        String[] item = getItemAsStringArray(position);
        if (item == null) {
            return null;
        }
        return item[ITEM_ID];
    }

    public String getItemName(int position) {
        String[] item = getItemAsStringArray(position);
        if (item == null) {
            return null;
        }
        return item[ITEM_NAME];
    }

    public void setContent(JSONArray content) {
        mContent = content;
    }

    protected abstract String[] getItemAsStringArray(int position);

    protected String getDisplayDate(String date) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        format.setTimeZone(TimeZone.getTimeZone("UTC"));

        try {
            Calendar cal = Calendar.getInstance();
            cal.setTime(format.parse(date));

            String[] months = mContext.getResources().getStringArray(R.array.months);
            return months[cal.get(Calendar.MONTH)] + " "
                    + cal.get(Calendar.DAY_OF_MONTH) + " "
                    + cal.get(Calendar.YEAR) + ", "
                    + String.format(
                    "%02d:%02d",
                    cal.get(Calendar.HOUR_OF_DAY),
                    cal.get(Calendar.MINUTE));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    protected void fetchImage(final ImageView v, final String memCacheId, String url, int alterImgResId) {
        if (mContentDownloads.containsKey(memCacheId)) {
            v.setImageResource(alterImgResId);
            return;
        }

        if (mMemoryCache.get(memCacheId) == null) {
            v.setImageResource(alterImgResId);

            AsyncTask task = new ImageFetcher(url, new ImageFetcher.OnImageFetchedListener() {
                @Override
                public void onImageFetched(Bitmap bitmap) {
                    if (bitmap != null) {
                        mMemoryCache.put(memCacheId, bitmap);
                        v.setImageBitmap(bitmap);

                        notifyDataSetChanged();
                    }
                    mContentDownloads.remove(memCacheId);
                }
            }).execute();
            mContentDownloads.put(memCacheId, task);
            return;
        }
        Bitmap bitmap = mMemoryCache.get(memCacheId);
        v.setImageBitmap(bitmap);
    }

    public void cancelAllDownloads() {
        Set downloads = mContentDownloads.entrySet();
        Iterator it = downloads.iterator();

        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            AsyncTask task = (AsyncTask) entry.getValue();
            task.cancel(true);
        }
        mContentDownloads.clear();
    }
}
