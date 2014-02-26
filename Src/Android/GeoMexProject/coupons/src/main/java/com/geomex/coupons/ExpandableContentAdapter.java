package com.geomex.coupons;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.support.v4.util.LruCache;
import android.widget.BaseExpandableListAdapter;
import android.widget.ImageView;

import org.json.JSONArray;
import org.json.JSONException;

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
public abstract class ExpandableContentAdapter extends BaseExpandableListAdapter {

    protected int GROUP_ID;
    protected int GROUP_NAME;
    protected int GROUP_SIZE;

    /*
    protected int CHILD_ID;
    protected int CHILD_NAME;
    */
    protected int CHILD_SIZE;

    protected Context mContext;
    protected JSONArray mGroupContent;
    protected JSONArray mChildrenContent;

    protected LruCache<String, Bitmap> mMemoryCache;

    private Map<String, AsyncTask> mContentDownloads;

    public ExpandableContentAdapter(Context context, JSONArray groupContent, JSONArray childrenContent) {
        mContext = context;
        mGroupContent = groupContent;
        mChildrenContent = childrenContent;

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
    public int getGroupCount() {
        if (mGroupContent == null) {
            return 0;
        }
        return mGroupContent.length();
    }

    @Override
    public int getChildrenCount(int groupPosition) {
        try {
            return getChildrenCountForGroup(groupPosition);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return 0;
    }

    @Override
    public Object getGroup(int groupPosition) {
        return null;
    }

    @Override
    public Object getChild(int groupPosition, int childPosition) {
        return null;
    }

    @Override
    public long getGroupId(int groupPosition) {
        return 0;
    }

    @Override
    public long getChildId(int groupPosition, int childPosition) {
        return 0;
    }

    @Override
    public boolean hasStableIds() {
        return false;
    }

    @Override
    public boolean isChildSelectable(int groupPosition, int childPosition) {
        return false;
    }

    public String getGroupIdAsString(int groupPosition) {
        String[] group = getGroupAsStringArray(groupPosition);
        if (group == null) {
            return null;
        }
        return group[GROUP_ID];
    }

    public String getGroupName(int groupPosition) {
        String[] group = getGroupAsStringArray(groupPosition);
        if (group == null) {
            return null;
        }
        return group[GROUP_NAME];
    }

    /*
    public String getChildIdAsString(int groupPosition, int childPosition) {
        return null;
    }

    public String getChildName(int groupPosition, int childPosition) {
        return null;
    }
    */

    public void setGroupContent(JSONArray groupContent) {
        mGroupContent = groupContent;
    }

    public void setChildrenContent(JSONArray childrenContent) {
        mChildrenContent = childrenContent;
    }

    protected abstract String[] getGroupAsStringArray(int groupPosition);

    protected abstract String[] getChildAsStringArray(int groupPosition, int childPosition);

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

    private int getChildrenCountForGroup(int groupPosition) throws JSONException {
        if (mChildrenContent == null) {
            return 0;
        }
        JSONArray json = (JSONArray) mChildrenContent.get(groupPosition);
        return json.length();
    }
}
