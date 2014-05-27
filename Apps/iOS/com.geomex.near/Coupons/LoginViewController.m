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

#import <ContextLocation/QLPlace.h>
#import <ContextLocation/QLPlaceEvent.h>
#import <ContextLocation/QLContentDescriptor.h>
#import <ContextProfiling/PRProfile.h>

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

    FBLoginView *loginView = [[FBLoginView alloc] initWithReadPermissions:@[@"user_birthday", @"user_education_history", @"user_work_history", @"email"]];
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
    [self startStandardUpdates];
}

- (void)startStandardUpdates{
    //CLLocationManager *locationManager;
    if (nil == _locationManager)
        _locationManager = [[CLLocationManager alloc] init];
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    _locationManager.delegate = self;
    [_locationManager startUpdatingLocation];
    
    CLLocation *location = [_locationManager location];
    _latitude = [[NSNumber numberWithDouble:location.coordinate.latitude] stringValue];
    _longitude = [[NSNumber numberWithDouble:location.coordinate.longitude] stringValue];
    [_locationManager stopUpdatingLocation];
}


- (void)loginViewShowingLoggedOutUser:(FBLoginView *)loginView {
    NSLog(@"Facebook not logged in!");
    once = 0;
    [_contextCoreConnector deleteAllUserDataAndOnSuccess:^{
        NSLog(@"User data deletion SUCCESS");
    }
    failure:^(NSError *error) {
        NSLog(@"User data deletion FAILURE: %@", error );
    }];

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
        alertTitle = @"Algo salió mal";
        alertText = [FBErrorUtility userMessageForError:error];
        [self showMessage:alertText withTitle:alertTitle];
        
    } else {
        // You need to find more information to handle the error within your app
        if ([FBErrorUtility errorCategoryForError:error] == FBErrorCategoryUserCancelled) {
            //The user refused to log in into your app, either ignore or...
            alertTitle = @"Login cancelado";
            alertText = @"Necesitas hacer login para entrar a la aplicación";
            [self showMessage:alertText withTitle:alertTitle];
            
        } else if ([FBErrorUtility errorCategoryForError:error] == FBErrorCategoryAuthenticationReopenSession){
            // We need to handle session closures that happen outside of the app
            alertTitle = @"Error de sesión";
            alertText = @"Tu sesión ya no es válida. Por favor entra otra vez.";
            [self showMessage:alertText withTitle:alertTitle];
            
        } else {
            // All other errors that can happen need retries
            // Show the user a generic error message
            alertTitle = @"Algo salió mal";
            alertText = @"Por favor reintenta";
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
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/Register", _userId];
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

- (void)didGetPlaceEvent:(QLPlaceEvent *)placeEvent
{
    NSLog(@"Registro lugar");
    NSString *placeId = [(NSDictionary *) placeEvent.place.placeAttributes valueForKey:@"location_id"];
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/IsLocationActive/%@", _userId, placeId];
    //NSLog(@"%@", url);
    NSData *data = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    NSArray *response = [NSJSONSerialization
                         JSONObjectWithData:data
                         options:NSJSONReadingMutableContainers
                         error:&error];
    //Check if Location is active
    if ([[[response objectAtIndex:0] objectForKey:@"State"] boolValue]) {
        [self startStandardUpdates];
        [self registerGeoEvent:placeEvent placeId:placeId];
    }
}

- (void)didGetContentDescriptors:(NSArray *)contentDescriptors{
    //Get timezone
    NSDate *date = [NSDate date];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"ZZZZZ"];
    _timeZone = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
    
    QLContentAttributes* content=[[contentDescriptors lastObject] contentAttributes];
    NSString *offerId = [content stringForKey:@"offer_id"];
    NSString *locationId = [content stringForKey:@"location_id"];
    NSString *clientId = [content stringForKey:@"client_id"];
    
    if (offerId != NULL && locationId != NULL) {
        NSURLSession *session = [NSURLSession sharedSession];
        NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/%@/ShowGeoMessage/%@/LocationId/%@/OfferId/%@", _userId, _timeZone, clientId, locationId, offerId];
        NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            NSHTTPURLResponse* httpResponse = (NSHTTPURLResponse*)response;
            if ([httpResponse statusCode] == 200) {
                NSArray *response = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                if ([[[response objectAtIndex:0] objectForKey:@"State"] boolValue]) {
                    [self postOneContentDescriptorLocalNotification:[contentDescriptors lastObject]];
                }
            }
        }];
        [dataTask resume];
    }
}
            
       //AQUI EMPIEZA
        /*
        NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/%@/ShowGeoMessage/%@/LocationId/%@/OfferId/%@", _userId, _timeZone, clientId, locationId, offerId];
        NSData *data = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
        NSError *error;
        NSArray *response = [NSJSONSerialization
                             JSONObjectWithData:data
                             options:NSJSONReadingMutableContainers
                             error:&error];
        //Check if Location is active
        if ([[[response objectAtIndex:0] objectForKey:@"State"] boolValue]) {
            [self postOneContentDescriptorLocalNotification:[contentDescriptors lastObject]];
        }
         */

- (void)postOneContentDescriptorLocalNotification:(QLContentDescriptor *)contentDescriptor
{
    [UIApplication sharedApplication].applicationIconBadgeNumber++;
    QLContentAttributes *attributes = [contentDescriptor contentAttributes];
    NSString *clientName = [attributes stringForKey:@"client_name"];
    NSString *offerTitle = [attributes stringForKey:@"offer_title"];
    NSString *offerSubtitle = [attributes stringForKey:@"offer_subtitle"];
    //NSString *offerId = [attributes stringForKey:@"offer_id"];
    NSString *clientId  = [attributes stringForKey:@"client_id"];
    NSString *clientHexColor = [attributes stringForKey:@"client_hex_color"];
    NSString *clientUrl = [attributes stringForKey:@"client_logo"];
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

-(void)registerGeoEvent:(QLPlaceEvent *)placeEvent placeId:(NSString*)placeId{
    NSMutableDictionary *geoData = [NSMutableDictionary new];
    switch (placeEvent.eventType)
    {
        case QLPlaceEventTypeAt:
            [geoData setValue:@"at" forKey:@"event"];
            break;
        case QLPlaceEventTypeLeft:
            [geoData setValue:@"left" forKey:@"event"];
            break;
    }
    [geoData setValue:_userId forKey:@"id"];
    [geoData setValue:placeId forKey:@"location_id"];
    [geoData setValue:_latitude forKey:@"latitude"];
    [geoData setValue:_longitude forKey:@"longitude"];
    //NSLog(@"Register GeoEvent latitude: %@, longitude: %@", _latitude, _longitude);
    
    
    NSError *e = nil;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:geoData options:kNilOptions error:&e];
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/GeoEvent", _userId];
    [request setURL:[NSURL URLWithString:url]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setHTTPBody:jsonData];
    
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
    self.contextCoreConnector = [QLContextCoreConnector new];
    
    [_contextCoreConnector checkStatusAndOnEnabled: ^(QLContextConnectorPermissions *contextConnectorPermissions) {
        NSLog(@"Already enabled");
    }
     disabled:^(NSError *error) {
         NSLog(@"Is not enabled");
         [self.contextCoreConnector enableFromViewController:self.navigationController
         success:^{
             NSLog(@"Gimbal enabled");
         }
         failure:^(NSError *error) {
             NSLog(@"Failed to initialize gimbal %@", error);
         }];
         
         self.contextCoreConnector = [[QLContextCoreConnector alloc] init];
         self.contextCoreConnector.permissionsDelegate = self;
         
         self.contextPlaceConnector = [[QLContextPlaceConnector alloc] init];
         self.contextPlaceConnector.delegate = self;
         
         self.contextInterestsConnector = [[PRContextInterestsConnector alloc] init];
         self.contextInterestsConnector.delegate = self;
         
         self.contentConnector = [[QLContentConnector alloc] init];
         self.contentConnector.delegate = self;
     }];
}

/*
- (IBAction)debug:(id)sender {
    NSLog(@"Entra debug");
    [_contextCoreConnector showPermissionsFromViewController:self success:NULL failure:^(NSError *error) {
        NSLog(@"%@", error);
    }];
}
 */
@end
