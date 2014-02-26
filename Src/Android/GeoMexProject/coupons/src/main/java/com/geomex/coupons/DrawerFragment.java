package com.geomex.coupons;

import android.app.SearchManager;
import android.content.Context;
import android.content.res.Configuration;
import android.os.Bundle;
import android.support.v4.app.ActionBarDrawerToggle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.widget.SearchView;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RadioButton;

/**
 * Created by adriangarcia on 14/12/13.
 */
public class DrawerFragment extends Fragment {

    private static final String COUPONS_TAG = "coupons";
    private static final String SOCIAL_TAG = "social";
    private static final String PLACES_TAG = "places";
    private static final String ADVERTS_TAG = "adverts";

    private static final String TITLE_KEY = "title";

    private DrawerLayout mDrawerLayout;
    private ActionBarDrawerToggle mDrawerToggle;
    private CharSequence mDrawerTitle;
    private CharSequence mTitle;

    private SearchView mActionSearch;
    private RadioButton mContentCoupons;
    private RadioButton mContentSocial;
    private RadioButton mContentPlaces;
    private RadioButton mContentAdverts;

    public DrawerFragment() {}

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_drawer, container, false);

        mTitle = mDrawerTitle = getActivity().getTitle();
        mDrawerLayout = (android.support.v4.widget.DrawerLayout) rootView.findViewById(R.id.drawer_layout);
        mDrawerToggle = new ActionBarDrawerToggle(getActivity(), mDrawerLayout,
                R.drawable.ic_drawer, R.string.drawer_open, R.string.drawer_close) {

            /** Called when a drawer has settled in a completely closed state. */
            public void onDrawerClosed(View view) {
                ((ActionBarActivity) getActivity()).getSupportActionBar().setTitle(mTitle);
            }

            /** Called when a drawer has settled in a completely open state. */
            public void onDrawerOpened(View drawerView) {
                ((ActionBarActivity) getActivity()).getSupportActionBar().setTitle(mDrawerTitle);
            }
        };

        mActionSearch = (SearchView) rootView.findViewById(R.id.action_search);
        mContentCoupons = (RadioButton) rootView.findViewById(R.id.content_coupons);
        mContentSocial = (RadioButton) rootView.findViewById(R.id.content_social);
        mContentPlaces = (RadioButton) rootView.findViewById(R.id.content_places);
        mContentAdverts = (RadioButton) rootView.findViewById(R.id.content_adverts);

        // Set the drawer toggle as the DrawerListener
        mDrawerLayout.setDrawerListener(mDrawerToggle);
        mDrawerLayout.setDrawerShadow(R.drawable.drawer_shadow, Gravity.START);

        SearchManager searchManager = (SearchManager) getActivity().getSystemService(Context.SEARCH_SERVICE);
        mActionSearch.setSearchableInfo(searchManager.getSearchableInfo(getActivity().getComponentName()));
        mActionSearch.setIconifiedByDefault(true);
        mActionSearch.onActionViewExpanded();
        mContentCoupons.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                contentCoupons();
            }
        });
        mContentSocial.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                contentSocial();
            }
        });
        mContentPlaces.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                contentPlaces();
            }
        });
        mContentAdverts.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                contentAdverts();
            }
        });

        if (savedInstanceState == null) {
            contentCoupons();
        } else {
            mTitle = savedInstanceState.getCharSequence(TITLE_KEY);
            ((ActionBarActivity) getActivity()).getSupportActionBar().setTitle(mTitle);
        }
        return rootView;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mDrawerToggle.syncState();
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        ActionBar actionBar = ((ActionBarActivity) getActivity()).getSupportActionBar();
        outState.putCharSequence(TITLE_KEY, actionBar.getTitle());
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        mDrawerToggle.onConfigurationChanged(newConfig);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Pass the event to ActionBarDrawerToggle, if it returns
        // true, then it has handled the app icon touch event
        if (mDrawerToggle.onOptionsItemSelected(item)) {
            return true;
        }
        // Handle your other action bar items...

        return super.onOptionsItemSelected(item);
    }

    private void contentCoupons() {
        mTitle = getResources().getString(R.string.content_coupons);

        FragmentManager fm = getChildFragmentManager();
        ContentCoupons fragment = (ContentCoupons) fm.findFragmentByTag(COUPONS_TAG);

        if (fragment == null) {
            fragment = new ContentCoupons();
        }
        if (!fragment.isAdded()) {
            removeAllFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, COUPONS_TAG)
                    .commit();
        }
        mDrawerLayout.closeDrawer(Gravity.START);
    }

    private void contentSocial() {
        mTitle = getResources().getString(R.string.content_social);

        FragmentManager fm = getChildFragmentManager();
        ContentSocial fragment = (ContentSocial) fm.findFragmentByTag(SOCIAL_TAG);

        if (fragment == null) {
            fragment = new ContentSocial();
        }
        if (!fragment.isAdded()) {
            removeAllFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, SOCIAL_TAG)
                    .commit();
        }
        mDrawerLayout.closeDrawer(Gravity.START);
    }

    private void contentPlaces() {
        mTitle = getResources().getString(R.string.content_places);

        FragmentManager fm = getChildFragmentManager();
        ContentPlaces fragment = (ContentPlaces) fm.findFragmentByTag(PLACES_TAG);

        if (fragment == null) {
            fragment = new ContentPlaces();
        }
        if (!fragment.isAdded()) {
            removeAllFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, PLACES_TAG)
                    .commit();
        }
        mDrawerLayout.closeDrawer(Gravity.START);
    }

    private void contentAdverts() {
        mTitle = getResources().getString(R.string.content_adverts);

        FragmentManager fm = getChildFragmentManager();
        ContentAdverts fragment = (ContentAdverts) fm.findFragmentByTag(ADVERTS_TAG);

        if (fragment == null) {
            fragment = new ContentAdverts();
        }
        if (!fragment.isAdded()) {
            removeAllFragments();
            fm.beginTransaction()
                    .add(R.id.content_frame, fragment, ADVERTS_TAG)
                    .commit();
        }
        mDrawerLayout.closeDrawer(Gravity.START);
    }

    // fm.replace(...) doesn't work as expected, you'd better call this method!
    private void removeAllFragments() {
        FragmentManager fm = getChildFragmentManager();
        FragmentTransaction transaction = fm.beginTransaction();

        Fragment fragment = fm.findFragmentByTag(COUPONS_TAG);
        if (fragment != null) {
            transaction.remove(fragment);
        }
        fragment = fm.findFragmentByTag(SOCIAL_TAG);
        if (fragment != null) {
            transaction.remove(fragment);
        }
        fragment = fm.findFragmentByTag(PLACES_TAG);
        if (fragment != null) {
            transaction.remove(fragment);
        }
        fragment = fm.findFragmentByTag(ADVERTS_TAG);
        if (fragment != null) {
            transaction.remove(fragment);
        }

        transaction.commit();
    }
}
