package com.geomex.coupons;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TabHost;

/**
 * Created by adriangarcia on 18/12/13.
 */
public class ContentAdverts extends Fragment {

    private static final String TAB1_ID = "tab1";
    private static final String TAB2_ID = "tab2";

    private TabHost mTabHost;
    private ViewPager mPager;
    private PagerAdapter mPagerAdapter;

    public ContentAdverts() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_adverts, container, false);
        return rootView;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        mTabHost = (TabHost) view.findViewById(android.R.id.tabhost);
        mPager = (ViewPager) view.findViewById(R.id.pager);
        mPagerAdapter = new PagerAdapter(getChildFragmentManager());

        mPager.setAdapter(mPagerAdapter);
        mPager.setOnPageChangeListener(new ViewPager.SimpleOnPageChangeListener() {
            @Override
            public void onPageSelected(int i) {
                mTabHost.setCurrentTab(i);
            }
        });
        mTabHost.setup();
        mTabHost.setOnTabChangedListener(new TabHost.OnTabChangeListener() {
            @Override
            public void onTabChanged(String tabId) {
                if (tabId.equals(TAB1_ID)) {
                    mPager.setCurrentItem(0);
                } else if (tabId.equals(TAB2_ID)) {
                    mPager.setCurrentItem(1);
                }
            }
        });

        String tab1 = getResources().getString(R.string.public_adverts);
        String tab2 = getResources().getString(R.string.private_adverts);
        mTabHost.addTab(mTabHost.newTabSpec(TAB1_ID)
                .setIndicator(tab1)
                .setContent(android.R.id.tabcontent));
        mTabHost.addTab(mTabHost.newTabSpec(TAB2_ID)
                .setIndicator(tab2)
                .setContent(android.R.id.tabcontent));
    }

    private static class PagerAdapter extends FragmentPagerAdapter {

        private static final int PUBLIC_ADVERTS = 0;
        private static final int PRIVATE_ADVERTS = 1;

        public PagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int i) {
            switch (i) {
                case PUBLIC_ADVERTS:
                    return new PublicAdverts();
                case PRIVATE_ADVERTS:
                    return new PrivateAdverts();
            }
            return null;
        }

        @Override
        public int getCount() {
            return 2;
        }
    }
}
