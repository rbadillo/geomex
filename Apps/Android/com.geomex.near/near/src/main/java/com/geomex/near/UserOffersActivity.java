package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.Rect;
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
import java.util.Locale;
import java.util.TimeZone;

/**
 * Created by adriangarcia on 27/03/14.
 */
public class UserOffersActivity extends ApplicationSessionActivity {

    public static final String EXTRA_USER_ID = "user_id";
    public static final String EXTRA_USER_NAME = "user_name";

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

        int color = getResources().getColor(R.color.blue_light);
        ColorDrawable drawable = new ColorDrawable(color);
        getSupportActionBar().setBackgroundDrawable(drawable);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("");

        if (savedInstanceState == null) {
            String id = getExtraUserId();
            String name = getExtraUserName();

            FragmentManager fm = getSupportFragmentManager();
            UserOffersFragment fragment = UserOffersFragment.newInstance(id, name);

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

    private String getExtraUserId() {
        return getIntent().getStringExtra(EXTRA_USER_ID);
    }

    private String getExtraUserName() {
        return getIntent().getStringExtra(EXTRA_USER_NAME);
    }

    public static class UserOffersFragment extends Fragment {
        private static final String ARGS_USER_ID = "user_id";
        private static final String ARGS_USER_NAME = "user_name";

        private static final String TAG_OFFER_DETAILS_FRAGMENT = "offer_details_fragment";
        private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

        private UserOffersAdapter userOffersAdapter;
        private ImageView userPicture;
        private ProgressBar progressView;
        private View emptyView;

        private boolean userPictureSet = false;

        public static UserOffersFragment newInstance(String userId, String userName) {
            UserOffersFragment fragment = new UserOffersFragment();
            Bundle args = new Bundle();
            args.putString(ARGS_USER_ID, userId);
            args.putString(ARGS_USER_NAME, userName);
            fragment.setArguments(args);
            return fragment;
        }

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
            return inflater.inflate(R.layout.fragment_user_offers, container, false);
        }

        @Override
        public void onViewCreated(View view, Bundle savedInstanceState) {
            super.onViewCreated(view, savedInstanceState);

            userOffersAdapter = new UserOffersAdapter(getActivity());
            AdapterView.OnItemClickListener userOffersListener = new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    String clientId = userOffersAdapter.getClientId(position);
                    String offerId = userOffersAdapter.getOfferId(position);
                    String offerImage = userOffersAdapter.getOfferImage(position);

                    OfferDetailsFragment.Callbacks callbacks = new OfferDetailsFragment.Callbacks() {
                        @Override
                        public void onDemandDownloadPriority() {
                            userOffersAdapter.cancelPendingTasks();
                        }

                        @Override
                        public void onDropDownloadPriority() {
                            userOffersAdapter.notifyDataSetChanged();
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
            ListView userOffers = (ListView) view.findViewById(R.id.user_offer_list);
            userOffers.setAdapter(userOffersAdapter);
            userOffers.setOnItemClickListener(userOffersListener);

            TextView title = (TextView) view.findViewById(R.id.title);
            TextView subtitle = (TextView) view.findViewById(R.id.subtitle);
            String activityTitle = getResources().getString(R.string.activity_user_offers);
            String userName = getArgsUserName().toUpperCase();
            title.setText(activityTitle);
            subtitle.setText(userName);

            userPicture = (ImageView) view.findViewById(R.id.user_picture);
            progressView = (ProgressBar) view.findViewById(R.id.progress_view);
            emptyView = view.findViewById(R.id.empty_view);

            final FragmentManager fm = getFragmentManager();
            final NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

            if (fragment != null) {
                NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                    @Override
                    public void onActionRetry() {
                        fm.beginTransaction()
                                .show(UserOffersFragment.this)
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
            userOffersAdapter.cancelPendingTasks();
        }

        private void refresh() {
            if (!userPictureSet) {
                fetchAndSetUserPicture();
            }
            String userId = getArgsUserId();
            RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
                @Override
                public void onRemoteContentFetched(JSONArray content) {
                    userOffersAdapter.changeRemoteContent(content);

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
            UserOffersFetcher userOffersFetcher = new UserOffersFetcher(getActivity(), userId);
            userOffersFetcher.setCallbacks(callbacks);
            userOffersFetcher.execute();
        }

        private void fetchAndSetUserPicture() {
            userPicture.setImageResource(R.drawable.ic_person_dark);
            String userId = getArgsUserId();
            String url = "https://graph.facebook.com/" + userId + "/picture?width=144&height=144";
            RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
                @Override
                public void onRemoteImageFetched(Bitmap image) {
                    if (image != null) {
                        userPicture.setImageBitmap(cropCircleImage(image));
                        userPictureSet = true;
                    }
                }
            };
            RemoteImageFetcher imageFetcher = new RemoteImageFetcher(url);
            imageFetcher.setCallbacks(callbacks);
            imageFetcher.execute();
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

        private void showErrorFragment() {
            final FragmentManager fm = getFragmentManager();
            final NetworkErrorFragment fragment = new NetworkErrorFragment();

            if (fm == null) return; //FragmentManager will be null when the user
                                    // has changed section already

            NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                @Override
                public void onActionRetry() {
                    fm.beginTransaction()
                            .show(UserOffersFragment.this)
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

        private String getArgsUserId() {
            Bundle args = getArguments();
            if (args == null) return null;

            return args.getString(ARGS_USER_ID);
        }

        private String getArgsUserName() {
            Bundle args = getArguments();
            if (args == null) return null;

            return args.getString(ARGS_USER_NAME);
        }
    }

    private static class UserOffersAdapter extends RemoteContentAdapter {
        private static final int OFFER_ID = 0;
        private static final int OFFER_TITLE = 1;
        private static final int OFFER_SUBTITLE = 2;
        private static final int OFFER_TIME_CREATED = 3;
        private static final int OFFER_IMAGE = 4;
        private static final int CLIENT_ID = 5;
        private static final int CLIENT_NAME = 6;
        private static final int RESPONSE_SIZE = 7;

        private Context context;

        public UserOffersAdapter(Context context) {
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
            View view = inflater.inflate(R.layout.user_offer_list_item, parent, false);

            String[] offer = getOffer(position);
            ImageView image = (ImageView) view.findViewById(R.id.offer_image);
            TextView title = (TextView) view.findViewById(R.id.offer_title);
            TextView subtitle = (TextView) view.findViewById(R.id.offer_subtitle);
            TextView endDate = (TextView) view.findViewById(R.id.offer_end_date);
            TextView name = (TextView) view.findViewById(R.id.client_name);

            fetchAndSetRoundedImage(offer[OFFER_IMAGE], image, R.drawable.ic_picture);
            title.setText(offer[OFFER_TITLE]);
            subtitle.setText(offer[OFFER_SUBTITLE]);
            endDate.setText(getOfferEndDate(position));
            name.setText(offer[CLIENT_NAME]);
            return view;
        }

        public String getOfferId(int position) {
            String[] offer = getOffer(position);
            return offer[OFFER_ID];
        }

        public String getOfferImage(int position) {
            String[] offer = getOffer(position);
            return offer[OFFER_IMAGE];
        }

        public String getClientId(int position) {
            String[] offer = getOffer(position);
            return offer[CLIENT_ID];
        }

        private String getOfferEndDate(int position) {
            String[] offer = getOffer(position);
            String[] monthsOfTheYear = context.getResources().getStringArray(R.array.months_of_the_year);
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("UTC"));

            Calendar calendar = Calendar.getInstance();
            try {
                calendar.setTime(format.parse(offer[OFFER_TIME_CREATED]));
                int month = calendar.get(Calendar.MONTH);
                int dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH);
                int year = calendar.get(Calendar.YEAR);

                return context.getResources().getString(R.string.user_offer_end_date) + " "
                        + monthsOfTheYear[month] + " "
                        + dayOfMonth + ", "
                        + year;
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
                offer[OFFER_TIME_CREATED] = json.getString("TimeCreated");
                offer[OFFER_IMAGE] = json.getString("PrimaryImage");
                offer[CLIENT_ID] = json.getString("ClientId");
                offer[CLIENT_NAME] = json.getString("ClientName");

                return offer;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

    private static class UserOffersFetcher extends RemoteContentFetcher {
        private Context context;
        private String userId;

        public UserOffersFetcher(Context context, String userId) {
            super();
            this.context = context;
            this.userId = userId;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String appUserId = Preferences.getUserFacebookId(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + appUserId +
                                      "/GetFriendActivity/" + userId);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

}
