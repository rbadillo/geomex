package com.geomex.near;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Created by adriangarcia on 02/03/14.
 */
public class Preferences {

    private static final String PREFS_FILE = "my_prefs_file";
    private static final String PREF_USER_FB_ID = "user_fb_id";
    private static final String PREF_USER_FB_PROFILE = "user_fb_profile";
    private static final String PREF_USER_FB_FRIENDS = "user_fb_friends";
    private static final String PREF_GCM_REGISTRATION_ID = "gcm_registration_id";
    private static final String PREF_USER_TIMEZONE = "user_timezone";
    private static final String PREF_USER_LOC_LATITUDE = "user_loc_latitude";
    private static final String PREF_USER_LOC_LONGITUDE = "user_loc_longitude";
    private static final String PREF_GCM_NOTIF_ENABLED = "gcm_notif_enabled";
    private static final String PREF_GIMBAL_NOTIF_ENABLED = "gimbal_notif_enabled";

    public static void setUserFacebookId(Context context, String value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PREF_USER_FB_ID, value);
        editor.commit();
    }

    public static void setUserFacebookProfile(Context context, String value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PREF_USER_FB_PROFILE, value);
        editor.commit();
    }

    public static void setUserFacebookFriends(Context context, String value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PREF_USER_FB_FRIENDS, value);
        editor.commit();
    }

    public static void setGcmRegistrationId(Context context, String value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PREF_GCM_REGISTRATION_ID, value);
        editor.commit();
    }

    public static void setUserTimeZone(Context context, String value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PREF_USER_TIMEZONE, value);
        editor.commit();
    }

    public static void setUserLocationLatitude(Context context, double value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong(PREF_USER_LOC_LATITUDE, Double.doubleToRawLongBits(value));
        editor.commit();
    }

    public static void setUserLocationLongitude(Context context, double value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong(PREF_USER_LOC_LONGITUDE, Double.doubleToRawLongBits(value));
        editor.commit();
    }

    public static void setGcmNotificationsEnabled(Context context, boolean value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(PREF_GCM_NOTIF_ENABLED, value);
        editor.commit();
    }

    public static void setGimbalNotificationsEnabled(Context context, boolean value) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(PREF_GIMBAL_NOTIF_ENABLED, value);
        editor.commit();
    }

    public static String getUserFacebookId(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getString(PREF_USER_FB_ID, null);
    }

    public static String getUserFacebookProfile(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getString(PREF_USER_FB_PROFILE, null);
    }

    public static String getUserFacebookFriends(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getString(PREF_USER_FB_FRIENDS, null);
    }

    public static String getGcmRegistrationId(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getString(PREF_GCM_REGISTRATION_ID, null);
    }

    public static String getUserTimeZone(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getString(PREF_USER_TIMEZONE, null);
    }

    public static double getUserLocationLatitude(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return Double.longBitsToDouble(prefs.getLong(PREF_USER_LOC_LATITUDE, 0));
    }

    public static double getUserLocationLongitude(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return Double.longBitsToDouble(prefs.getLong(PREF_USER_LOC_LONGITUDE, 0));
    }

    public static boolean getGcmNotificationsEnabled(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getBoolean(PREF_GCM_NOTIF_ENABLED, false);
    }

    public static boolean getGimbalNotificationsEnabled(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_FILE, 0);
        return prefs.getBoolean(PREF_GIMBAL_NOTIF_ENABLED, false);
    }

}
