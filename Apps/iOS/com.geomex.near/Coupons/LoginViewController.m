//
//  LoginViewController.m
//  Coupons
//
//  Created by Daniel Fernandez on 2/20/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "LoginViewController.h"
#import "ActiveClientsViewController.h"
#import "CouponsAppDelegate.h"
#import "SidebarViewController.h"

@interface LoginViewController ()

@end

@implementation LoginViewController

static dispatch_once_t once;

- (void)openUrl:(id)sender
{
    UIGestureRecognizer *rec = (UIGestureRecognizer *)sender;
    
    id hitLabel = [self.view hitTest:[rec locationInView:self.view] withEvent:UIEventTypeTouches];
    
    if ([hitLabel isKindOfClass:[UILabel class]]) {
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"http://descubrenear.com"]];
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    //NSLog( @"### running FB sdk version: %@", [FBSettings sdkVersion] );

    FBLoginView *loginView = [[FBLoginView alloc] initWithReadPermissions:@[@"user_birthday", @"user_education_history", @"user_work_history", @"email", @"user_friends"]];
    loginView.delegate = self;
    loginView.frame = CGRectMake(40, 117, 241, 58);
    CGRect screenRect = [[UIScreen mainScreen] bounds];
    CGFloat screenHeight = screenRect.size.height;
    loginView.center = CGPointMake(self.view.center.x, screenHeight - (self.view.center.y / 3));
    [self.view addSubview:loginView];
    
    //Near link
    _nearLabel.userInteractionEnabled = YES;
    
    UITapGestureRecognizer *gestureRec = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(openUrl:)];
    gestureRec.numberOfTouchesRequired = 1;
    gestureRec.numberOfTapsRequired = 1;
    [_nearLabel addGestureRecognizer:gestureRec];
    
    //Init latitude and longitude and call Location Update
    _latitude = @"null";
    _longitude = @"null";
    
    if(self.placeManager == nil)
    {
        NSLog(@"Initializing GMBLPlaceManager - viewDidLoad");
        self.placeManager = [GMBLPlaceManager new];
        self.placeManager.delegate = self;
    }
    
    if(self.communicationManager == nil)
    {
        NSLog(@"Initializing GMBLCommunicationManager - viewDidLoad");
        self.communicationManager = [GMBLCommunicationManager new];
        self.communicationManager.delegate = self;
    }
    
    
    [self startStandardUpdates];
}

- (void)startStandardUpdates{
    //CLLocationManager *locationManager;
    if (nil == _locationManager)
        _locationManager = [[CLLocationManager alloc] init];
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    _locationManager.delegate = self;
    [_locationManager requestAlwaysAuthorization];
    [_locationManager startUpdatingLocation];
    
    CLLocation *location = [_locationManager location];
    _latitude = [[NSNumber numberWithDouble:location.coordinate.latitude] stringValue];
    _longitude = [[NSNumber numberWithDouble:location.coordinate.longitude] stringValue];
    [_locationManager stopUpdatingLocation];
}


- (void)loginViewShowingLoggedOutUser:(FBLoginView *)loginView {
    NSLog(@"Facebook not logged in!");
    once = 0;
}

// This method will be called when the user information has been fetched
- (void)loginViewFetchedUserInfo:(FBLoginView *)loginView user:(id<FBGraphUser>)user {
    //AppDelegate object to set the userId and get the device_token
    CouponsAppDelegate *appDelegate = (CouponsAppDelegate *)[[UIApplication sharedApplication] delegate];
    appDelegate.userId = _userId = user.id;
    //NSLog(@"user id: %@", _userId);
    appDelegate.userName = user.name;
    [FBRequestConnection startForMeWithCompletionHandler:^(FBRequestConnection *connection, id result, NSError *error) {
        if (!error) {
            NSDate *date = [NSDate date];
            NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
            [dateFormat setDateFormat:@"ZZZZZ"];
            result[@"timezone"] = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
            result[@"device_token"] = appDelegate.device_token;
            result[@"phone_type"] = @"iOS";
            result[@"event"] = @"Register";
            result[@"latitude"] = _latitude;
            result[@"longitude"] = _longitude;
            //NSLog(@"user info: %@", result);
            [self registerWithNear:result];
        } else {
            NSLog(@"Error loginViewShowingLoggedInUser");
            // An error occurred, we need to handle the error
            // See: https://developers.facebook.com/docs/ios/errors
            //[FBSession.activeSession closeAndClearTokenInformation];
            //[self dismissViewControllerAnimated:YES completion:nil];
        }
    }];
    

    //Execute code only once
    dispatch_once(&once, ^ {
        [self enableGimbal];
        //If succesful go to next view
        SidebarViewController *sidebar = [self.storyboard instantiateViewControllerWithIdentifier:@"sidebar"];
        [self presentViewController:sidebar animated:NO completion:nil];
    });
}

// Implement the loginViewShowingLoggedInUser: delegate method to modify your app's UI for a logged-in user experience
- (void)loginViewShowingLoggedInUser:(FBLoginView *)loginView {
}

- (void)loginView:(FBLoginView *)loginView
      handleError:(NSError *)error{
    [self handleAuthError:error];
}

- (void)handleAuthError:(NSError *)error
{
    NSString *alertText;
    NSString *alertTitle;
    if ([FBErrorUtility shouldNotifyUserForError:error] == YES){
        // Error requires people using you app to make an action outside your app to recover
        alertTitle = @"Near";
        alertText = [FBErrorUtility userMessageForError:error];
        [self showMessage:alertText withTitle:alertTitle];
        
    } else {
        // You need to find more information to handle the error within your app
        if ([FBErrorUtility errorCategoryForError:error] == FBErrorCategoryUserCancelled) {
            //The user refused to log in into your app, either ignore or...
            alertTitle = @"Near";
            alertText = @"Necesitas hacer login para utilizar la aplicación";
            [self showMessage:alertText withTitle:alertTitle];
            
        } else if ([FBErrorUtility errorCategoryForError:error] == FBErrorCategoryAuthenticationReopenSession){
            // We need to handle session closures that happen outside of the app
            alertTitle = @"Near";
            alertText = @"Tu sesión ya no es válida. Por favor entra otra vez.";
            [self showMessage:alertText withTitle:alertTitle];
            
        } else {
            // All other errors that can happen need retries
            // Show the user a generic error message
            alertTitle = @"Near";
            alertText = @"Hubo un error con el servidor, por favor intenta de nuevo";
            [self showMessage:alertText withTitle:alertTitle];
        }
    }
}

- (void)showMessage:(NSString *)text withTitle:(NSString *)title
{
    [[[UIAlertView alloc] initWithTitle:title
                                message:text
                               delegate:self
                      cancelButtonTitle:@"OK"
                      otherButtonTitles:nil] show];
}

//Sends the registration request with Facebook and device data to Near's server
- (void)registerWithNear:(id)data{
    NSError *e = nil;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:data options:kNilOptions error:&e];
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/Register", _userId];
    [request setURL:[NSURL URLWithString:url]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setHTTPBody:jsonData];
    
    //NSLog(@"JSON summary: %@", [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding]);
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];
    [connection start];
    if (e) {
        NSLog(@"Register with Near Failed!");
    } else {
        NSLog(@"Register with Near successful");
    }
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)placeManager:(GMBLPlaceManager *)manager didBeginVisit:(GMBLVisit *)visit
{
    //NSLog(@"Gimbal - didBeginVisit");
    NSString *placeId = [visit.place.attributes stringForKey:@"location_id"];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/IsLocationActive/%@", _userId, placeId];
    //NSLog(@"%@", url);
    //NSLog(@"Sending Request - didBeginVisit");
    NSData *data = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    //NSLog(@"Reading Response - didBeginVisit");
    NSArray *response = [NSJSONSerialization
                         JSONObjectWithData:data
                         options:NSJSONReadingMutableContainers
                         error:&error];
    //Check if Location is active
    //NSLog(@"Checking Location is Active - didBeginVisit");
    if ([[[response objectAtIndex:0] objectForKey:@"State"] boolValue]) {
        [self startStandardUpdates];
        //NSLog(@"Calling Function registerGeoEvent AT - didBeginVisit");
        [self registerGeoEvent:@"at" placeId:placeId];
    }
}

- (void)placeManager:(GMBLPlaceManager *)manager didEndVisit:(GMBLVisit *)visit
{
    //NSLog(@"Gimbal - didEndVisit");
    NSString *placeId = [visit.place.attributes stringForKey:@"location_id"];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/IsLocationActive/%@", _userId, placeId];
    //NSLog(@"%@", url);
    //NSLog(@"Sending Request - didEndVisit");
    NSData *data = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    //NSLog(@"Reading Response - didEndVisit");
    NSArray *response = [NSJSONSerialization
                         JSONObjectWithData:data
                         options:NSJSONReadingMutableContainers
                         error:&error];
    //Check if Location is active
    //NSLog(@"Checking Location is Active - didEndVisit");
    if ([[[response objectAtIndex:0] objectForKey:@"State"] boolValue]) {
        [self startStandardUpdates];
        //NSLog(@"Calling Function registerGeoEvent LEFT - didEndVisit");
        [self registerGeoEvent:@"left" placeId:placeId];
    }
}

- (void)postOneContentDescriptorLocalNotification:(GMBLCommunication *)communication
{
    //NSLog(@"Inside postOneContentDescriptorLocalNotification");
    [UIApplication sharedApplication].applicationIconBadgeNumber++;
    NSString *clientName = [communication.attributes stringForKey:@"client_name"];
    NSString *offerTitle = [communication.attributes stringForKey:@"offer_title"];
    NSString *offerSubtitle = [communication.attributes stringForKey:@"offer_subtitle"];
    //NSString *offerId = [attributes stringForKey:@"offer_id"];
    NSString *clientId  = [communication.attributes stringForKey:@"client_id"];
    NSString *clientHexColor = [communication.attributes stringForKey:@"client_hex_color"];
    NSString *clientUrl = [communication.attributes stringForKey:@"client_logo"];
    NSString *alertBody = [NSString stringWithFormat:@"%@: %@ - %@", clientName, offerTitle, offerSubtitle];
    NSString* newString = [alertBody stringByReplacingOccurrencesOfString:@"%" withString:@"\uFF05"];
    NSMutableDictionary *notificationInfo = [NSMutableDictionary new];
    [notificationInfo setObject:clientId forKey:@"clientId"];
    //[notificationInfo setObject:offerId forKey:@"offerId"];
    [notificationInfo setObject:clientHexColor forKey:@"clientHexColor"];
    [notificationInfo setObject:clientUrl forKey:@"clientUrl"];
    [notificationInfo setObject:clientName forKey:@"clientName"];
    
    UILocalNotification *notification = [[UILocalNotification alloc]init];
    [notification setAlertBody:newString];
    [notification setFireDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    [notification setTimeZone:[NSTimeZone defaultTimeZone]];
    [notification setSoundName:UILocalNotificationDefaultSoundName];
    notification.userInfo = notificationInfo;
    [[UIApplication sharedApplication] scheduleLocalNotification:notification];
    NSLog(@"Notification scheduled. %@", alertBody);
}

-(void)filterCommunications:(NSArray *)communications
{
    //NSLog(@"Inside filterCommunications");
    for(GMBLCommunication *communication in communications)
    {
        //Get timezone
        NSDate *date = [NSDate date];
        NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
        [dateFormat setDateFormat:@"ZZZZZ"];
        _timeZone = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
        
        NSString *offerId = [communication.attributes stringForKey:@"offer_id"];
        NSString *locationId = [communication.attributes stringForKey:@"location_id"];
        NSString *clientId = [communication.attributes stringForKey:@"client_id"];
        
        if (offerId != NULL && locationId != NULL)
        {
            NSURLSession *session = [NSURLSession sharedSession];
            
            NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/%@/ShowGeoMessage/%@/LocationId/%@/OfferId/%@", _userId, _timeZone, clientId, locationId, offerId];
            
            //NSLog(@"URL: %@",url);
            
            NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error){
                
                //NSLog(@"Got Response From ShowGeoMessage API");
                
                NSHTTPURLResponse* httpResponse = (NSHTTPURLResponse*)response;
                if ([httpResponse statusCode] == 200)
                {
                    NSArray *response = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                    if ([[[response objectAtIndex:0] objectForKey:@"State"] boolValue])
                    {
                        // Add Communication To Display
                        //NSLog(@"Calling postOneContentDescriptorLocalNotification");
                        if(communication == nil)
                        {
                            NSLog(@"communication is NIL");
                        }
                        [self postOneContentDescriptorLocalNotification: communication];
                    }
                }
            }];
            [dataTask resume];
        }
    }
    
}

- (NSArray *)communicationManager:(GMBLCommunicationManager *)manager
presentLocalNotificationsForCommunications:(NSArray *)communications
                         forVisit:(GMBLVisit *)visit
{
    // This will be invoked when a user has a communication for the place that was entered or exited.
    // Return an array of communications you would like presented as local notifications.
    //NSLog(@"Inside presentLocalNotificationsForCommunications");
    //NSLog(@"Inside presentLocalNotificationsForCommunications - Calling filterCommunications");
    [self filterCommunications:communications];
    return nil;
}


- (UILocalNotification *)communicationManager:(GMBLCommunicationManager *)manager
                prepareNotificationForDisplay: (UILocalNotification *)notification
                             forCommunication:(GMBLCommunication *)communication

{
    //NSLog(@"Inside prepareNotificationForDisplay");
    UILocalNotification *localNotification = [[UILocalNotification alloc] init];
    return localNotification;
}


-(void)registerGeoEvent:(NSString *)placeEvent placeId:(NSString*)placeId{
    
    //NSLog(@"Inside registerGeoEvent function");
    NSMutableDictionary *geoData = [NSMutableDictionary new];
    [geoData setValue:placeEvent forKey:@"event"];
    [geoData setValue:_userId forKey:@"id"];
    [geoData setValue:placeId forKey:@"location_id"];
    [geoData setValue:_latitude forKey:@"latitude"];
    [geoData setValue:_longitude forKey:@"longitude"];
    //NSLog(@"Register GeoEvent latitude: %@, longitude: %@", _latitude, _longitude);
    
    NSError *e = nil;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:geoData options:kNilOptions error:&e];
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/GeoEvent", _userId];
    //NSLog(@"URL: %@",url);
    [request setURL:[NSURL URLWithString:url]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setHTTPBody:jsonData];
    
    //NSLog(@"Making Request - registerGeoEvent");
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];
    [connection start];
    if (!e) {
        NSLog(@"Register GeoEvent succesful");
    } else {
        NSLog(@"Register GeoEvent Failed!");
    }
    
}

-(void) enableGimbal{
    //Check Gimbal status
    [Gimbal setAPIKey:@"9d0edc61-5ea6-4e6c-aa35-a02873ef7e36" options:nil];
    
    if(![Gimbal isStarted])
    {
        
        if(![GMBLPlaceManager isMonitoring])
        {
            
            if(self.placeManager == nil)
            {
                NSLog(@"Initializing GMBLPlaceManager - enableGimbal");
                self.placeManager = [GMBLPlaceManager new];
                self.placeManager.delegate = self;
            }
            [GMBLPlaceManager startMonitoring];
            NSLog(@"Gimbal Place Manager Enabled Successfully");
        }
        else
        {
            NSLog(@"Gimbal Place Manager Already Enabled");
        }
        
        if(![GMBLCommunicationManager isReceivingCommunications])
        {
            
            if(self.communicationManager == nil)
            {
                NSLog(@"Initializing GMBLCommunicationManager - enableGimbal");
                self.communicationManager = [GMBLCommunicationManager new];
                self.communicationManager.delegate = self;
            }
            [GMBLCommunicationManager startReceivingCommunications];
            NSLog(@"Gimbal Communication Manager Enabled Successfully");
        }
        else
        {
            NSLog(@"Gimbal Communication Manager Already Enabled");
        }
    }
    else
    {
        NSLog(@"Gimbal Manager Already Enabled");
    }
}

@end
