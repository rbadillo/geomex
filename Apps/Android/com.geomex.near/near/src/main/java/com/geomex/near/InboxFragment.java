package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.text.Html;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.*;

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
 * Created by adriangarcia on 02/03/14.
 */
public class InboxFragment extends Fragment {

    private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

    private InboxAdapter inboxAdapter;
    private ProgressBar progressView;
    private View emptyView;

    public static InboxFragment newInstance() {
        InboxFragment fragment = new InboxFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_inbox, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        inboxAdapter = new InboxAdapter(getActivity());
        AdapterView.OnItemClickListener inboxListener = new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String clientId = inboxAdapter.getClientId(position);
                String name = inboxAdapter.getClientName(position);
                String logo = inboxAdapter.getClientLogo(position);
                String color = inboxAdapter.getClientColor(position);
                String messageId = inboxAdapter.getMessageId(position);
                String messageIsRead = inboxAdapter.getMessageIsRead(position);

                Intent intent = new Intent(getActivity(), OffersActivity.class);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_ID, clientId);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_NAME, name);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_LOGO, logo);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_COLOR, color);
                startActivity(intent);

                if (messageIsRead.equals("0")) {
                    MessageReader messageReader = new MessageReader(getActivity(), messageId);
                    messageReader.execute();
                }
            }
        };
        android.widget.ListView inbox = (android.widget.ListView) view.findViewById(R.id.inbox_list);
        inbox.setAdapter(inboxAdapter);
        inbox.setOnItemClickListener(inboxListener);

        progressView = (ProgressBar) view.findViewById(R.id.progress_view);
        emptyView = view.findViewById(R.id.empty_view);

        final FragmentManager fm = getFragmentManager();
        final NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

        if (fragment != null) {
            NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                @Override
                public void onActionRetry() {
                    fm.beginTransaction()
                            .show(InboxFragment.this)
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
        inboxAdapter.cancelPendingTasks();
    }

    private void refresh() {
        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                inboxAdapter.changeRemoteContent(content);

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
        InboxFetcher inboxFetcher = new InboxFetcher(getActivity());
        inboxFetcher.setCallbacks(callbacks);
        inboxFetcher.execute();
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
                        .show(InboxFragment.this)
                        .remove(fragment)
                        .commit();

                progressView.setVisibility(View.VISIBLE);
                refresh();
            }
        };
        fragment.setCallbacks(callbacks);

        fm.beginTransaction()
                .hide(this)
                .add(R.id.content_frame, fragment, TAG_NETWORK_ERROR_FRAGMENT)
                .commit();
    }

    private boolean errorFragmentShown() {
        FragmentManager fm = getFragmentManager();
        NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);
        return fragment != null && fragment.isAdded();
    }

    private static class InboxAdapter extends RemoteContentAdapter {
        private static final int CLIENT_ID = 0;
        private static final int CLIENT_NAME = 1;
        private static final int CLIENT_LOGO = 2;
        private static final int CLIENT_COLOR = 3;
        private static final int MESSAGE_ID = 4;
        private static final int MESSAGE_TEXT = 5;
        private static final int MESSAGE_TIME = 6;
        private static final int MESSAGE_IS_READ = 7;
        private static final int RESPONSE_SIZE = 8;

        private Context context;

        public InboxAdapter(Context context) {
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
            View view = inflater.inflate(R.layout.inbox_list_item, parent, false);

            String[] message = getMessage(position);
            ImageView logo = (ImageView) view.findViewById(R.id.client_logo);
            TextView name = (TextView) view.findViewById(R.id.client_name);
            TextView text = (TextView) view.findViewById(R.id.message_text);
            TextView time = (TextView) view.findViewById(R.id.message_time);
            fetchAndSetImage(message[CLIENT_LOGO], logo, R.drawable.ic_picture);
            name.setText(message[CLIENT_NAME]);
            text.setText(message[MESSAGE_TEXT]);
            time.setText(getMessageTime(position));

            if (message[MESSAGE_IS_READ].equals("1")) {
                text.setText(message[MESSAGE_TEXT]);
            } else {
                text.setText(Html.fromHtml("<b>" + message[MESSAGE_TEXT] + "</b>"));
            }
            return view;
        }

        public String getClientId(int position) {
            String[] message = getMessage(position);
            return message[CLIENT_ID];
        }

        public String getClientName(int position) {
            String[] message = getMessage(position);
            return message[CLIENT_NAME];
        }

        public String getClientLogo(int position) {
            String[] message = getMessage(position);
            return message[CLIENT_LOGO];
        }

        public String getMessageId(int position) {
            String[] message = getMessage(position);
            return message[MESSAGE_ID];
        }

        public String getMessageIsRead(int position) {
            String[] message = getMessage(position);
            return message[MESSAGE_IS_READ];
        }

        public String getClientColor(int position) {
            String[] message = getMessage(position);
            return message[CLIENT_COLOR];
        }

        private String getMessageTime(int position) {
            String[] message = getMessage(position);
            String[] monthsOfTheYear = context.getResources().getStringArray(R.array.months_of_the_year);
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("UTC"));

            Calendar calendar = Calendar.getInstance();
            try {
                calendar.setTime(format.parse(message[MESSAGE_TIME]));
                int month = calendar.get(Calendar.MONTH);
                int dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH);
                int year = calendar.get(Calendar.YEAR);

                return dayOfMonth + "/" + monthsOfTheYear[month] + "/" + year;
            } catch (ParseException e) {
                e.printStackTrace();
            }
            return null;
        }

        private String[] getMessage(int position) {
            JSONArray content = getRemoteContent();
            try {
                JSONObject json = content.getJSONObject(position);

                String[] message = new String[RESPONSE_SIZE];

                message[CLIENT_ID] = json.getString("ClientId");
                message[CLIENT_NAME] = json.getString("ClientName");
                message[CLIENT_LOGO] = json.getString("Logo");
                message[CLIENT_COLOR] = json.getString("ClientHexColor");
                message[MESSAGE_ID] = json.getString("MessageId");
                message[MESSAGE_TEXT] = json.getString("Message");
                message[MESSAGE_TIME] = json.getString("TimeCreated");
                message[MESSAGE_IS_READ] = json.getString("MessageRead");

                return message;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

    private static class InboxFetcher extends RemoteContentFetcher {
        private Context context;

        public InboxFetcher(Context context) {
            super();
            this.context = context;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            String userTimeZone = Preferences.getUserTimeZone(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + userId +
                                      "/" + userTimeZone + "/GetMessages");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

    private static class MessageReader extends AsyncTask<Void, Void, Void> {
        private Context context;
        private String messageId;

        public MessageReader(Context context, String messageId) {
            super();
            this.context = context;
            this.messageId = messageId;
        }

        @Override
        protected Void doInBackground(Void... params) {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + userId +
                    "/ReadMessage/" + messageId);

            try {
                client.execute(get);
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

}
