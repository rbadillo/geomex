//
//  OfferDetailsViewController.h
//  near
//
//  Created by Daniel Fernandez on 3/10/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

@interface OfferDetailsViewController : UIViewController <CLLocationManagerDelegate,UIAlertViewDelegate>
- (IBAction)redeem:(id)sender;
@property (strong, nonatomic) IBOutlet UIButton *redeem;
@property (strong, nonatomic) IBOutlet UILabel *instructions;
@property (strong, nonatomic) IBOutlet UILabel *disclaimer;
@property (strong, nonatomic) IBOutlet UIImageView *offerImage;
@property (strong, nonatomic) IBOutlet UILabel *offerTitle;
@property (strong, nonatomic) IBOutlet UILabel *offerSubtitle;
@property (strong, nonatomic) IBOutlet UILabel *errorLabel;


@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *clientId;
@property (strong, nonatomic) NSString *timeZone;
@property (strong, nonatomic) NSString *offerId;
@property (strong, nonatomic) NSArray *offerDetails;
@property (nonatomic , strong) CLLocationManager *locationManager;
@property (strong, nonatomic) NSString *latitude;
@property (strong, nonatomic) NSString *longitude;
@property (strong, nonatomic) UIImage *imageOfUnderlyingView;
@property BOOL buttonState;

@end
