package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.apptentive.android.application.ApplicationSessionActivity;

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
 * Created by adriangarcia on 04/03/14.
 */
public class OffersActivity extends ApplicationSessionActivity {

    public static final String EXTRA_CLIENT_ID = "client_id";
    public static final String EXTRA_CLIENT_NAME = "client_name";
    public static final String EXTRA_CLIENT_LOGO = "client_logo";
    public static final String EXTRA_CLIENT_COLOR = "client_color";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final Context context = this;
        setOnSessionStartedListener(new SessionStartedListener() {
            @Override
            public void onSessionStarted() {
                new AppEventSender(context, AppEventSender.EVENT_APP_OPEN).execute();
            }
        });
        setOnSessionStoppedListener(new SessionStoppedListener() {
            @Override
            public void onSessionStopped() {
                new AppEventSender(context, AppEventSender.EVENT_APP_CLOSE).execute();
            }
        });

        String hexColor = getExtraClientColor();
        int color = Color.parseColor(hexColor);
        ColorDrawable drawable = new ColorDrawable(color);
        getSupportActionBar().setBackgroundDrawable(drawable);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("");

        if (savedInstanceState == null) {
            String id = getExtraClientId();
            String name = getExtraClientName();
            String logo = getExtraClientLogo();

            FragmentManager fm = getSupportFragmentManager();
            OffersFragment fragment = OffersFragment.newInstance(id, name, logo, hexColor);

            fm.beginTransaction()
                    .add(android.R.id.content, fragment)
                    .commit();
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

    private String getExtraClientId() {
        return getIntent().getStringExtra(EXTRA_CLIENT_ID);
    }

    private String getExtraClientName() {
        return getIntent().getStringExtra(EXTRA_CLIENT_NAME);
    }

    private String getExtraClientLogo() {
        return getIntent().getStringExtra(EXTRA_CLIENT_LOGO);
    }

    private String getExtraClientColor() {
        return getIntent().getStringExtra(EXTRA_CLIENT_COLOR);
    }

    public static class OffersFragment extends Fragment {
        private static final String ARGS_CLIENT_ID = "client_id";
        private static final String ARGS_CLIENT_NAME = "client_name";
        private static final String ARGS_CLIENT_LOGO = "client_logo";
        private static final String ARGS_CLIENT_COLOR = "client_color";

        private static final String TAG_OFFER_DETAILS_FRAGMENT = "offer_details_fragment";
        private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

        private OffersAdapter offersAdapter;
        private ImageView clientLogo;
        private ProgressBar progressView;
        private View emptyView;

        private boolean clientLogoSet = false;

        public static OffersFragment newInstance(String clientId,
                                                 String clientName,
                                                 String clientLogo,
                                                 String clientColor) {
            OffersFragment fragment = new OffersFragment();
            Bundle args = new Bundle();
            args.putString(ARGS_CLIENT_ID, clientId);
            args.putString(ARGS_CLIENT_NAME, clientName);
            args.putString(ARGS_CLIENT_LOGO, clientLogo);
            args.putString(ARGS_CLIENT_COLOR, clientColor);
            fragment.setArguments(args);
            return fragment;
        }

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
            return inflater.inflate(R.layout.fragment_offers, container, false);
        }

        @Override
        public void onViewCreated(View view, Bundle savedInstanceState) {
            super.onViewCreated(view, savedInstanceState);

            offersAdapter = new OffersAdapter(getActivity());
            AdapterView.OnItemClickListener offersListener = new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    String clientId = getArgsClientId();
                    String offerId = offersAdapter.getOfferId(position);
                    String offerImage = offersAdapter.getOfferImage(position);

                    OfferDetailsFragment.Callbacks callbacks = new OfferDetailsFragment.Callbacks() {
                        @Override
                        public void onDemandDownloadPriority() {
                            offersAdapter.cancelPendingTasks();
                        }

                        @Override
                        public void onDropDownloadPriority() {
                            offersAdapter.notifyDataSetChanged();
                        }

                        @Override
                        public void onFlowFinished() {
                            refresh();
                        }
                    };

                    FragmentManager fm = getFragmentManager();
                    OfferDetailsFragment fragment = OfferDetailsFragment.newInstance(clientId, offerId, offerImage);
                    fragment.setCallbacks(callbacks);

                    fm.beginTransaction()
                            .add(android.R.id.content, fragment, TAG_OFFER_DETAILS_FRAGMENT)
                            .addToBackStack(null)
                            .commit();
                }
            };
            ListView offers = (ListView) view.findViewById(R.id.offer_list);
            offers.setAdapter(offersAdapter);
            offers.setOnItemClickListener(offersListener);

            View header = view.findViewById(R.id.header);
            String hexColor = getArgsClientColor();
            int color = Color.parseColor(hexColor);
            header.setBackgroundColor(color);

            TextView title = (TextView) view.findViewById(R.id.title);
            TextView subtitle = (TextView) view.findViewById(R.id.subtitle);
            String activityTitle = getResources().getString(R.string.activity_offers);
            String clientName = getArgsClientName().toUpperCase();
            title.setText(activityTitle);
            subtitle.setText(clientName);

            clientLogo = (ImageView) view.findViewById(R.id.client_logo);
            progressView = (ProgressBar) view.findViewById(R.id.progress_view);
            emptyView = view.findViewById(R.id.empty_view);

            final FragmentManager fm = getFragmentManager();
            final NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

            if (fragment != null) {
                NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                    @Override
                    public void onActionRetry() {
                        fm.beginTransaction()
                                .show(OffersFragment.this)
                                .remove(fragment)
                                .commit();

                        progressView.setVisibility(View.VISIBLE);
                        refresh();
                    }
                };
                fragment.setCallbacks(callbacks);

                fm.beginTransaction()
                        .hide(this)
                        .commit();
            }
        }

        @Override
        public void onStart() {
            super.onStart();

            if (!errorFragmentShown()) {
                refresh();
            }
        }

        @Override
        public void onStop() {
            super.onStop();
            offersAdapter.cancelPendingTasks();
        }

        private void refresh() {
            if (!clientLogoSet) {
                fetchAndSetClientLogo();
            }
            String clientId = getArgsClientId();
            RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
                @Override
                public void onRemoteContentFetched(JSONArray content) {
                    offersAdapter.changeRemoteContent(content);

                    progressView.setVisibility(View.GONE);
                    if (content == null) {
                        showErrorFragment();
                        return;
                    } else if (content.length() == 0) {
                        emptyView.setVisibility(View.VISIBLE);
                    } else {
                        emptyView.setVisibility(View.GONE);
                    }
                }
            };
            OffersFetcher offersFetcher = new OffersFetcher(getActivity(), clientId);
            offersFetcher.setCallbacks(callbacks);
            offersFetcher.execute();
        }

        private void fetchAndSetClientLogo() {
            clientLogo.setImageResource(R.drawable.ic_picture_dark);
            String url = getArgsClientLogo();
            RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
                @Override
                public void onRemoteImageFetched(Bitmap image) {
                    if (image != null) {
                        clientLogo.setImageBitmap(image);
                        clientLogoSet = true;
                    }
                }
            };
            RemoteImageFetcher imageFetcher = new RemoteImageFetcher(url);
            imageFetcher.setCallbacks(callbacks);
            imageFetcher.execute();
        }

        private void showErrorFragment() {
            final FragmentManager fm = getFragmentManager();
            final NetworkErrorFragment fragment = new NetworkErrorFragment();

            if (fm == null) return; //FragmentManager will be null when the user
                                    // has changed section already

            NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                @Override
                public void onActionRetry() {
                    fm.beginTransaction()
                            .show(OffersFragment.this)
                            .remove(fragment)
                            .commit();

                    progressView.setVisibility(View.VISIBLE);
                    refresh();
                }
            };
            fragment.setCallbacks(callbacks);

            fm.beginTransaction()
                    .hide(this)
                    .add(android.R.id.content, fragment, TAG_NETWORK_ERROR_FRAGMENT)
                    .commit();
        }

        private boolean errorFragmentShown() {
            FragmentManager fm = getFragmentManager();
            NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);
            return fragment != null && fragment.isAdded();
        }

        private String getArgsClientId() {
            Bundle args = getArguments();
            if (args == null) return null;

            return args.getString(ARGS_CLIENT_ID);
        }

        private String getArgsClientName() {
            Bundle args = getArguments();
            if (args == null) return null;

            return args.getString(ARGS_CLIENT_NAME);
        }

        private String getArgsClientLogo() {
            Bundle args = getArguments();
            if (args == null) return null;

            return args.getString(ARGS_CLIENT_LOGO);
        }

        private String getArgsClientColor() {
            Bundle args = getArguments();
            if (args == null) return null;

            return args.getString(ARGS_CLIENT_COLOR);
        }
    }

    private static class OffersAdapter extends RemoteContentAdapter {
        private static final int OFFER_ID = 0;
        private static final int OFFER_TITLE = 1;
        private static final int OFFER_SUBTITLE = 2;
        private static final int OFFER_START_DATE = 3;
        private static final int OFFER_END_DATE = 4;
        private static final int OFFER_IMAGE = 5;
        private static final int OFFER_IS_PRIVATE = 6;
        private static final int RESPONSE_SIZE = 7;

        private Context context;

        public OffersAdapter(Context context) {
            super();
            this.context = context;
        }

        @Override
        public Object getItem(int position) {
            return null;
        }

        @Override
        public long getItemId(int position) {
            return 0;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View view = inflater.inflate(R.layout.offer_list_item, parent, false);

            String[] offer = getOffer(position);
            View bg = view.findViewById(R.id.offer_bg);
            ImageView image = (ImageView) view.findViewById(R.id.offer_image);
            TextView title = (TextView) view.findViewById(R.id.offer_title);
            TextView subtitle = (TextView) view.findViewById(R.id.offer_subtitle);
            TextView endDate = (TextView) view.findViewById(R.id.offer_end_date);
            View gold = view.findViewById(R.id.offer_is_gold);

            title.setText(offer[OFFER_TITLE]);
            subtitle.setText(offer[OFFER_SUBTITLE]);
            fetchAndSetRoundedImage(offer[OFFER_IMAGE], image, R.drawable.ic_picture);

            if (offerAvailable(position)) {
                bg.setBackgroundResource(R.drawable.list_item_bg);
                endDate.setText(getOfferEndDate(position));
            } else {
                bg.setBackgroundResource(R.drawable.list_item_bg_selected);
                endDate.setText(getOfferStartDate(position));
            }
            if (offer[OFFER_IS_PRIVATE].equals("1")) {
                gold.setVisibility(View.VISIBLE);
            } else {
                gold.setVisibility(View.GONE);
            }
            return view;
        }

        @Override
        public boolean areAllItemsEnabled() {
            return false;
        }

        @Override
        public boolean isEnabled(int position) {
            return offerAvailable(position);
        }

        public String getOfferId(int position) {
            String[] offer = getOffer(position);
            return offer[OFFER_ID];
        }

        public String getOfferImage(int position) {
            String[] offer = getOffer(position);
            return offer[OFFER_IMAGE];
        }

        private boolean offerAvailable(int position) {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("UTC"));

            try {
                String offer[] = getOffer(position);
                Calendar cal = Calendar.getInstance();
                Date now = cal.getTime();
                Date startDate = format.parse(offer[OFFER_START_DATE]);

                if (startDate.after(now)) {
                    return false;
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return true;
        }

        private String getOfferStartDate(int position) {
            String[] offer = getOffer(position);
            String[] monthsOfTheYear = context.getResources().getStringArray(R.array.months_of_the_year);
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("UTC"));

            Calendar calendar = Calendar.getInstance();
            try {
                calendar.setTime(format.parse(offer[OFFER_START_DATE]));
                int month = calendar.get(Calendar.MONTH);
                int dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH);
                int year = calendar.get(Calendar.YEAR);
                int hour = calendar.get(Calendar.HOUR_OF_DAY);
                int minute = calendar.get(Calendar.MINUTE);

                return context.getResources().getString(R.string.offer_start_date) + " "
                        + monthsOfTheYear[month] + " "
                        + dayOfMonth + ", "
                        + year + " – "
                        + String.format("%02d:%02d", hour, minute);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return null;
        }

        private String getOfferEndDate(int position) {
            String[] offer = getOffer(position);
            String[] monthsOfTheYear = context.getResources().getStringArray(R.array.months_of_the_year);
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("UTC"));

            Calendar calendar = Calendar.getInstance();
            try {
                calendar.setTime(format.parse(offer[OFFER_END_DATE]));
                int month = calendar.get(Calendar.MONTH);
                int dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH);
                int year = calendar.get(Calendar.YEAR);
                int hour = calendar.get(Calendar.HOUR_OF_DAY);
                int minute = calendar.get(Calendar.MINUTE);

                return context.getResources().getString(R.string.offer_end_date) + " "
                       + monthsOfTheYear[month] + " "
                       + dayOfMonth + ", "
                       + year + " – "
                       + String.format("%02d:%02d", hour, minute);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return null;
        }

        private String[] getOffer(int position) {
            JSONArray content = getRemoteContent();
            try {
                JSONObject json = content.getJSONObject(position);

                String[] offer = new String[RESPONSE_SIZE];

                offer[OFFER_ID] = json.getString("OfferId");
                offer[OFFER_TITLE] = json.getString("Title");
                offer[OFFER_SUBTITLE] = json.getString("Subtitle");
                offer[OFFER_START_DATE] = json.getString("StartDate");
                offer[OFFER_END_DATE] = json.getString("EndDate");
                offer[OFFER_IMAGE] = json.getString("PrimaryImage");
                offer[OFFER_IS_PRIVATE] = json.getString("IsPrivate");

                return offer;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

    private static class OffersFetcher extends RemoteContentFetcher {
        private Context context;
        private String clientId;

        public OffersFetcher(Context context, String clientId) {
            super();
            this.context = context;
            this.clientId = clientId;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            double latitude = Preferences.getUserLocationLatitude(context);
            double longitude = Preferences.getUserLocationLongitude(context);
            HttpGet get = new HttpGet("http://near.noip.me/" + userId +
                                      "/" + userTimeZone +
                                      "/GetOffers/" + clientId +
                                      "?latitude=" + latitude +
                                      "&longitude=" + longitude);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

}
