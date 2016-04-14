package com.geomex.near;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.Rect;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.text.Html;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

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
import java.util.Calendar;
import java.util.Locale;

/**
 * Created by adriangarcia on 15/03/14.
 */
public class OfferDetailsFragment extends Fragment {

    private static final String ARGS_CLIENT_ID = "client_id";
    private static final String ARGS_OFFER_ID = "offer_id";
    private static final String ARGS_OFFER_IMAGE = "offer_image";

    private static final String STATE_REDEEM_CODE = "redeem_code";

    private ImageView offerImage;
    private TextView title;
    private TextView subtitle;
    private TextView instructions;
    private Button redeem;
    private TextView disclaimer;
    private View emptyView;
    private ProgressBar progressView;

    private Callbacks callbacks;
    private boolean offerImageSet = false;
    private boolean isConfirmed = false;
    private String redeemCode = null;
    private String isMulti = null;

    public static OfferDetailsFragment newInstance(String clientId, String offerId, String offerImage) {
        OfferDetailsFragment fragment = new OfferDetailsFragment();
        Bundle args = new Bundle();
        args.putString(ARGS_CLIENT_ID, clientId);
        args.putString(ARGS_OFFER_ID, offerId);
        args.putString(ARGS_OFFER_IMAGE, offerImage);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_offer_details, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        offerImage = (ImageView) view.findViewById(R.id.offer_image);
        title = (TextView) view.findViewById(R.id.offer_title);
        subtitle = (TextView) view.findViewById(R.id.offer_subtitle);
        instructions = (TextView) view.findViewById(R.id.offer_instructions);
        redeem = (Button) view.findViewById(R.id.action_redeem);
        disclaimer = (TextView) view.findViewById(R.id.offer_disclaimer);
        emptyView = view.findViewById(R.id.empty_view);
        progressView = (ProgressBar) view.findViewById(R.id.progress_view);

        redeem.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isConfirmed) {
                    final String clientId = getArgsClientId();
                    final  String offerId = getArgsOfferId();

                    if (callbacks != null) {
                        callbacks.onDemandDownloadPriority();
                    }
                    if (isMulti != null && isMulti.equalsIgnoreCase("0")) {
                        //show single use alert dialog here
                        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(getActivity());
                        alertDialogBuilder.setMessage("Esta oferta solo puede ser utilizada 1 vez, ¿Deseas continuar?");

                        alertDialogBuilder.setPositiveButton("Si", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface arg0, int arg1) {
                                RemoteContentFetcher.Callbacks fetcherCallbacks = new RemoteContentFetcher.Callbacks() {
                                    @Override
                                    public void onRemoteContentFetched(JSONArray content) {
                                        if (content == null) {
                                            getActivity().getSupportFragmentManager()
                                                    .beginTransaction()
                                                    .remove(OfferDetailsFragment.this)
                                                    .commit();
                                        } else {
                                            showRedeemCode(content);
                                        }
                                        if (callbacks != null) {
                                            callbacks.onDropDownloadPriority();
                                            callbacks.onFlowFinished();
                                        }
                                    }
                                };
                                RedeemCodeFetcher redeemCodeFetcher = new RedeemCodeFetcher(getActivity(),
                                        clientId,
                                        offerId);
                                redeemCodeFetcher.setCallbacks(fetcherCallbacks);
                                redeemCodeFetcher.execute();
                                redeem.setOnClickListener(null);
                            }
                        });

                        alertDialogBuilder.setNegativeButton("No", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                //do nothing
                            }
                        });

                        AlertDialog alertDialog = alertDialogBuilder.create();
                        alertDialog.show();
                    } else {
                        RemoteContentFetcher.Callbacks fetcherCallbacks = new RemoteContentFetcher.Callbacks() {
                            @Override
                            public void onRemoteContentFetched(JSONArray content) {
                                if (content == null) {
                                    getActivity().getSupportFragmentManager()
                                            .beginTransaction()
                                            .remove(OfferDetailsFragment.this)
                                            .commit();
                                } else {
                                    showRedeemCode(content);
                                }
                                if (callbacks != null) {
                                    callbacks.onDropDownloadPriority();
                                    callbacks.onFlowFinished();
                                }
                            }
                        };
                        RedeemCodeFetcher redeemCodeFetcher = new RedeemCodeFetcher(getActivity(),
                                clientId,
                                offerId);
                        redeemCodeFetcher.setCallbacks(fetcherCallbacks);
                        redeemCodeFetcher.execute();
                        redeem.setOnClickListener(null);
                    }

                } else {
                    String confirm = getResources().getString(R.string.action_confirm_redeem);
                    redeem.setText(confirm);
                    isConfirmed = true;
                }
            }
        });

        if (savedInstanceState != null) {
            redeemCode = savedInstanceState.getString(STATE_REDEEM_CODE);

            if (redeemCode != null) {
                Calendar calendar = Calendar.getInstance();
                String[] monthsOfTheYear = getResources().getStringArray(R.array.months_of_the_year);
                String todayDate = String.format(Locale.US, "%d-%s-%d %02d:%02d",
                        calendar.get(Calendar.DAY_OF_MONTH),
                        monthsOfTheYear[calendar.get(Calendar.MONTH)],
                        calendar.get(Calendar.YEAR),
                        calendar.get(Calendar.HOUR_OF_DAY),
                        calendar.get(Calendar.MINUTE));
                redeem.setText(Html.fromHtml(redeemCode + "<br /><small>" + todayDate + "</small>"));
                redeem.setOnClickListener(null);
            }
        }
    }


    @Override
    public void onStart() {
        super.onStart();

        String clientId = getArgsClientId();
        String offerId = getArgsOfferId();

        if (callbacks != null) {
            callbacks.onDemandDownloadPriority();
        }
        if (!offerImageSet) {
            fetchAndSetOfferImage();
        }
        RemoteContentFetcher.Callbacks fetcherCallbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                progressView.setVisibility(View.GONE);
                if (content == null) {
                    getActivity().getSupportFragmentManager()
                            .beginTransaction()
                            .remove(OfferDetailsFragment.this)
                            .commit();
                } else {
                    showOfferDetails(content);
                }
                if (callbacks != null) {
                    callbacks.onDropDownloadPriority();
                }
            }
        };
        OfferDetailsFetcher offerDetailsFetcher = new OfferDetailsFetcher(getActivity(),
                                                                          clientId,
                                                                          offerId);
        offerDetailsFetcher.setCallbacks(fetcherCallbacks);
        offerDetailsFetcher.execute();
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString(STATE_REDEEM_CODE, redeemCode);
    }

    public void setCallbacks(Callbacks callbacks) {
        this.callbacks = callbacks;
    }

    private void fetchAndSetOfferImage() {
        offerImage.setImageResource(R.drawable.ic_picture_dark);
        String url = getArgsOfferImage();
        RemoteImageFetcher.Callbacks callbacks = new RemoteImageFetcher.Callbacks() {
            @Override
            public void onRemoteImageFetched(Bitmap image) {
                if (image != null) {
                    offerImage.setImageBitmap(cropCircleImage(image));
                    offerImageSet = true;
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

    private void showOfferDetails(JSONArray content) {
        try {
            JSONObject json = content.getJSONObject(0);

            String statusLine = json.getString("StatusLine");
            String statusCode = statusLine.split(" ")[1];
            if (statusCode.equals("200")) {
                String offerTitle = json.getString("Title");
                String offerSubtitle = json.getString("Subtitle");
                String offerInstructions = json.getString("Instructions");
                String offerDisclaimer = json.getString("Disclaimer");
                isMulti = json.getString("MultiUse");

                offerImage.setVisibility(View.VISIBLE);
                title.setText(offerTitle);
                subtitle.setText(offerSubtitle);
                instructions.setText(offerInstructions);
                redeem.setVisibility(View.VISIBLE);
                disclaimer.setText(offerDisclaimer);
            } else {
                emptyView.setVisibility(View.VISIBLE);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void showRedeemCode(JSONArray content) {
        Calendar calendar = Calendar.getInstance();
        String[] monthsOfTheYear = getResources().getStringArray(R.array.months_of_the_year);
        String todayDate = String.format(Locale.US, "%d-%s-%d %02d:%02d",
                                         calendar.get(Calendar.DAY_OF_MONTH),
                                         monthsOfTheYear[calendar.get(Calendar.MONTH)],
                                         calendar.get(Calendar.YEAR),
                                         calendar.get(Calendar.HOUR_OF_DAY),
                                         calendar.get(Calendar.MINUTE));
        try {
            JSONObject json = content.getJSONObject(0);

            String redeemCode = json.getString("Code");
            this.redeemCode = redeemCode;
            redeem.setText(Html.fromHtml(redeemCode + "<br /><small>" + todayDate + "</small>"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private String getArgsClientId() {
        Bundle args = getArguments();
        if (args == null) return null;

        return args.getString(ARGS_CLIENT_ID);
    }

    private String getArgsOfferId() {
        Bundle args = getArguments();
        if (args == null) return null;

        return args.getString(ARGS_OFFER_ID);
    }

    private String getArgsOfferImage() {
        Bundle args = getArguments();
        if (args == null) return null;

        return args.getString(ARGS_OFFER_IMAGE);
    }

    public interface Callbacks {
        public void onDemandDownloadPriority();

        public void onDropDownloadPriority();

        public void onFlowFinished();
    }

    private static class OfferDetailsFetcher extends RemoteContentFetcher {
        private Context context;
        private String clientId;
        private String offerId;

        public OfferDetailsFetcher(Context context, String clientId, String offerId) {
            super();
            this.context = context;
            this.clientId = clientId;
            this.offerId = offerId;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            double latitude = Preferences.getUserLocationLatitude(context);
            double longitude = Preferences.getUserLocationLongitude(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + userId +
                                      "/" + userTimeZone +
                                      "/GetOffers/" + clientId +
                                      "/OfferDetails/" + offerId +
                                      "?latitude=" + latitude +
                                      "&longitude=" + longitude);

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            JSONArray jsonArray = new JSONArray(tokener);
            jsonArray.getJSONObject(0).put("StatusLine", response.getStatusLine().toString());
            return jsonArray;
        }
    }

    private static class RedeemCodeFetcher extends RemoteContentFetcher {
        private Context context;
        private String clientId;
        private String offerId;

        public RedeemCodeFetcher(Context context, String clientId, String offerId) {
            super();
            this.context = context;
            this.clientId = clientId;
            this.offerId = offerId;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            double latitude = Preferences.getUserLocationLatitude(context);
            double longitude = Preferences.getUserLocationLongitude(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + userId +
                                      "/" +userTimeZone +
                                      "/GetOffers/" + clientId +
                                      "/Redeem/" + offerId +
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
