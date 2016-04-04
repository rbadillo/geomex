package com.geomex.near;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.GridView;
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

/**
 * Created by adriangarcia on 02/03/14.
 */
public class ClientsFragment extends Fragment {

    private static final String TAG_NETWORK_ERROR_FRAGMENT = "network_error_fragment";

    private ClientsAdapter clientsAdapter;
    private ProgressBar progressView;
    private View emptyView;

    public static ClientsFragment newInstance() {
        ClientsFragment fragment = new ClientsFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_clients, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        clientsAdapter = new ClientsAdapter(getActivity());
        AdapterView.OnItemClickListener clientsListener = new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String clientId = clientsAdapter.getClientId(position);
                String name = clientsAdapter.getClientName(position);
                String logo = clientsAdapter.getClientLogo(position);
                String color = clientsAdapter.getClientColor(position);

                Intent intent = new Intent(getActivity(), OffersActivity.class);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_ID, clientId);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_NAME, name);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_LOGO, logo);
                intent.putExtra(OffersActivity.EXTRA_CLIENT_COLOR, color);
                startActivity(intent);
            }
        };
        GridView clients = (GridView) view.findViewById(R.id.client_grid);
        clients.setAdapter(clientsAdapter);
        clients.setOnItemClickListener(clientsListener);

        progressView = (ProgressBar) view.findViewById(R.id.progress_view);
        emptyView = view.findViewById(R.id.empty_view);

        final FragmentManager fm = getFragmentManager();
        final NetworkErrorFragment fragment = (NetworkErrorFragment) fm.findFragmentByTag(TAG_NETWORK_ERROR_FRAGMENT);

        if (fragment != null) {
            NetworkErrorFragment.Callbacks callbacks = new NetworkErrorFragment.Callbacks() {
                @Override
                public void onActionRetry() {
                    fm.beginTransaction()
                            .show(ClientsFragment.this)
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
        clientsAdapter.cancelPendingTasks();
    }

    private void refresh() {
        RemoteContentFetcher.Callbacks callbacks = new RemoteContentFetcher.Callbacks() {
            @Override
            public void onRemoteContentFetched(JSONArray content) {
                clientsAdapter.changeRemoteContent(content);

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
        ClientsFetcher clientsFetcher = new ClientsFetcher(getActivity());
        clientsFetcher.setCallbacks(callbacks);
        clientsFetcher.execute();
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
                        .show(ClientsFragment.this)
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

    private static class ClientsAdapter extends RemoteContentAdapter {
        private static final int CLIENT_ID = 0;
        private static final int CLIENT_NAME = 1;
        private static final int CLIENT_LOGO = 2;
        private static final int CLIENT_IS_GOLD = 3;
        private static final int CLIENT_COLOR = 4;
        private static final int RESPONSE_SIZE = 5;

        private Context context;

        public ClientsAdapter(Context context) {
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
            View view = inflater.inflate(R.layout.client_grid_item, parent, false);

            String[] client = getClient(position);
            TextView name = (TextView) view.findViewById(R.id.client_name);
            ImageView logo = (ImageView) view.findViewById(R.id.client_logo);
            View gold = view.findViewById(R.id.offer_is_gold);
            name.setText(client[CLIENT_NAME]);
            fetchAndSetImage(client[CLIENT_LOGO], logo, R.drawable.ic_picture);

            if (client[CLIENT_IS_GOLD].equals("1")) {
                gold.setVisibility(View.VISIBLE);
            } else {
                gold.setVisibility(View.INVISIBLE);
            }
            return view;
        }

        public String getClientId(int position) {
            String[] client = getClient(position);
            return client[CLIENT_ID];
        }

        public String getClientName(int position) {
            String[] client = getClient(position);
            return client[CLIENT_NAME];
        }

        public String getClientLogo(int position) {
            String[] client = getClient(position);
            return client[CLIENT_LOGO];
        }

        public String getClientColor(int position) {
            String[] client = getClient(position);
            return client[CLIENT_COLOR];
        }

        private String[] getClient(int position) {
            JSONArray content = getRemoteContent();
            try {
                JSONObject json = content.getJSONObject(position);

                String[] client = new String[RESPONSE_SIZE];

                client[CLIENT_ID] = json.getString("ClientId");
                client[CLIENT_NAME] = json.getString("Name");
                client[CLIENT_LOGO] = json.getString("Logo");
                client[CLIENT_IS_GOLD] = json.getString("IsGold");
                client[CLIENT_COLOR] = json.getString("ClientHexColor");

                return client;
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

    private static class ClientsFetcher extends RemoteContentFetcher {
        private Context context;

        public ClientsFetcher(Context context) {
            super();
            this.context = context;
        }

        @Override
        protected JSONArray fetchRemoteContent() throws IOException, JSONException {
            HttpClient client = new DefaultHttpClient();
            String userId = Preferences.getUserFacebookId(context);
            HttpGet get = new HttpGet("http://api.descubrenear.com/" + userId + "/GetAllActiveClients");

            HttpResponse response = client.execute(get);
            InputStream stream = response.getEntity().getContent();
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            JSONTokener tokener = new JSONTokener(reader.readLine());
            return new JSONArray(tokener);
        }
    }

}
