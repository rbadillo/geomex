//
//  LoginViewController.h
//  Coupons
//
//  Created by Daniel Fernandez on 2/20/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <FacebookSDK/FacebookSDK.h>

#import <ContextCore/QLContextCore.h>
#import <ContextLocation/QLContextPlaceConnector.h>
#import <ContextProfiling/PRContextInterestsConnector.h>

@interface LoginViewController : UIViewController <FBLoginViewDelegate, CLLocationManagerDelegate, QLContextCorePermissionsDelegate, QLContextPlaceConnectorDelegate, PRContextInterestsDelegate, QLTimeContentDelegate>

@property (nonatomic , strong) CLLocationManager *locationManager;
@property (strong, nonatomic) NSString *latitude;
@property (strong, nonatomic) NSString *longitude;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *timeZone;


@property (nonatomic, strong) QLContextCoreConnector *contextCoreConnector;
@property (nonatomic, strong) QLContextPlaceConnector *contextPlaceConnector;
@property (nonatomic, strong) PRContextInterestsConnector *contextInterestsConnector;
@property (nonatomic, strong) QLContentConnector *contentConnector;
@property (strong, nonatomic) IBOutlet UILabel *nearLabel;

@end
