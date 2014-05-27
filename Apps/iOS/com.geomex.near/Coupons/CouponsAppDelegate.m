//
//  CouponsAppDelegate.m
//  Coupons
//
//  Created by Daniel Fernandez on 2/20/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "CouponsAppDelegate.h"
#import <FacebookSDK/FacebookSDK.h>
#import "OffersViewController.h"
//#import "ActiveClientsViewController.h"
#import "SidebarViewController.h"
/* Gimbal
#import <ContextCore/QLContextCoreConnector.h>
#import <ContextLocation/QLPlaceEvent.h>
#import <ContextLocation/QLPlace.h>
#import <ContextLocation/QLContentDescriptor.h>
 */

@implementation CouponsAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [FBLoginView class];
    // Override point for customization after application launch.
    
    //Register for remote notifications with APNS
    [[UIApplication sharedApplication] registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound | UIRemoteNotificationTypeAlert)];
    
    application.applicationIconBadgeNumber = 0;
    
    // Handle launching from a notification
    UILocalNotification *localNotif =
    [launchOptions objectForKey:UIApplicationLaunchOptionsLocalNotificationKey];
    if (localNotif) {
        NSLog(@"Recieved Notif %@",localNotif);
    }
    
    [[UINavigationBar appearance] setBackgroundImage:[[UIImage alloc] init]
                                      forBarPosition:UIBarPositionAny
                                          barMetrics:UIBarMetricsDefault];
    
    [[UINavigationBar appearance] setShadowImage:[[UIImage alloc] init]];
    
    return YES;
}

- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)devToken {
    //const void *devTokenBytes = [devToken bytes];
    NSString *deviceToken = [[[[devToken description]
                               stringByReplacingOccurrencesOfString: @"<" withString: @""]
                              stringByReplacingOccurrencesOfString: @">" withString: @""]
                             stringByReplacingOccurrencesOfString: @" " withString: @""];
    //NSLog(@"Device Token is :%@", deviceToken);
    _device_token = deviceToken;
    
}

- (void)application:(UIApplication *)app didFailToRegisterForRemoteNotificationsWithError:(NSError *)err {
    NSLog(@"Error in registration: %@", err);
    _device_token = @"null";
}

- (void)application:(UIApplication *)app didReceiveLocalNotification:(UILocalNotification *)notif {
    if (app.applicationState == UIApplicationStateInactive ) {
        // Handle the notificaton when the app is in background
        //[UIApplication sharedApplication].applicationIconBadgeNumber++;
        NSMutableDictionary *data = [NSMutableDictionary new];
        data[@"clientId"] = [notif.userInfo objectForKey:@"clientId"];
        data[@"clientHexColor"] = [notif.userInfo objectForKey:@"clientHexColor"];
        data[@"clientUrl"] = [notif.userInfo objectForKey:@"clientUrl"];
        data[@"clientName"] = [notif.userInfo objectForKey:@"clientName"];
        data[@"userId"] = _userId;
        [[NSNotificationCenter defaultCenter] postNotificationName:@"didReceiveLocalNotification" object:nil userInfo:data];
    } else {
        NSLog(@"Received local notification while in foreground");
    }

}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo{
    if (application.applicationState == UIApplicationStateInactive ) {
        [UIApplication sharedApplication].applicationIconBadgeNumber++;
        [[NSNotificationCenter defaultCenter] postNotificationName:@"didReceiveRemoteNotification" object:nil];
    }
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
    
    // Call FBAppCall's handleOpenURL:sourceApplication to handle Facebook app responses
    BOOL wasHandled = [FBAppCall handleOpenURL:url sourceApplication:sourceApplication];
    
    // You can add your app-specific url handling code here if needed
    
    return wasHandled;
}

- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    [self startStandardUpdates];
    [self appEvent:NO];
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
    [[NSNotificationCenter defaultCenter] postNotificationName:@"didEnterForeground" object:nil userInfo:nil];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    [self startStandardUpdates];
    [self appEvent:YES];
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
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
/*
-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations{
    NSLog(@"Entra appdelegate");
}
*/

- (void)appEvent:(BOOL)action{
    if (_userId) {
        NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
        if (action) {
            data[@"event"] = @"OpenedApp";
        } else {
            data[@"event"] = @"ClosedApp";
        }
        data[@"latitude"] = _latitude;
        data[@"longitude"] = _longitude;
        NSError *e = nil;
        NSData* jsonData = [NSJSONSerialization dataWithJSONObject:data options:kNilOptions error:&e];
        NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
        NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/AppEvent", _userId];
        //NSLog(@"url: %@", url);
        [request setURL: [NSURL URLWithString:url]];
        [request setHTTPMethod:@"POST"];
        [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
        [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
        [request setHTTPBody:jsonData];
        
        NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];
        [connection start];
    }
}

@end
