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
#import <Gimbal/Gimbal.h>

@interface LoginViewController : UIViewController <FBLoginViewDelegate, CLLocationManagerDelegate,GMBLPlaceManagerDelegate, GMBLCommunicationManagerDelegate>

@property (nonatomic , strong) CLLocationManager *locationManager;
@property (strong, nonatomic) NSString *latitude;
@property (strong, nonatomic) NSString *longitude;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *timeZone;
@property (nonatomic) GMBLPlaceManager *placeManager;
@property (nonatomic) GMBLCommunicationManager *communicationManager;
@property (strong, nonatomic) IBOutlet UILabel *nearLabel;

- (void)postOneContentDescriptorLocalNotification:(GMBLCommunication *)communication;
-(void)filterCommunications:(NSArray *)communications;

@end
