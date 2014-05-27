//
//  ClientDetailViewController.h
//  near
//
//  Created by Daniel Fernandez on 3/2/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

@interface OffersViewController : UIViewController <UITableViewDataSource, CLLocationManagerDelegate>
@property (strong, nonatomic) IBOutlet UITableView *tableView;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *clientId;
@property (strong, nonatomic) NSString *clientName;
@property (strong, nonatomic) NSURL *clientUrl;
@property (strong, nonatomic) NSString *timeZone;
@property (strong, nonatomic) NSArray *offersArray;
@property (strong, nonatomic) NSString *clientHexColor;
@property (strong, nonatomic) IBOutlet UILabel *clientTitle;
@property (strong, nonatomic) IBOutlet UIImageView *clientImage;
@property (strong, nonatomic) IBOutlet UIView *headerView;

@property (nonatomic , strong) CLLocationManager *locationManager;
@property (strong, nonatomic) NSString *latitude;
@property (strong, nonatomic) NSString *longitude;

@end
