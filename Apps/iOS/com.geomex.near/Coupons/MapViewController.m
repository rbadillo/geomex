//
//  MapViewController.m
//  near
//
//  Created by Daniel Fernandez on 4/2/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "MapViewController.h"
#import "CouponsAppDelegate.h"
#import "SWRevealViewController.h"
#import "OffersViewController.h"
#import "MessagesViewController.h"

@interface MapViewController ()

@end

@implementation MapViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    _sidebarButton.target = self.revealViewController;
    _sidebarButton.action = @selector(revealToggle:);
    
    CouponsAppDelegate *appdelegate = (CouponsAppDelegate *)[[UIApplication sharedApplication] delegate];
    _userId = appdelegate.userId;
    _mapView.showsUserLocation = YES;
    [self startStandardUpdates];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(receiveNotification:)
                                                 name:@"didReceiveLocalNotification"
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(receiveNotification:)
                                                 name:@"didReceiveRemoteNotification"
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(receiveNotification:)
                                                 name:@"didEnterForeground"
                                               object:nil];
}

- (void) receiveNotification:(NSNotification *) notification{
    if ([[notification name] isEqualToString:@"didReceiveLocalNotification"]){
        NSDictionary *userInfo = notification.userInfo;
        OffersViewController *destViewController = [self.storyboard instantiateViewControllerWithIdentifier:@"ClientDetail"];
        destViewController.userId = [userInfo objectForKey:@"userId"];
        destViewController.clientId = [userInfo objectForKey:@"clientId"];
        destViewController.clientHexColor = [userInfo objectForKey:@"clientHexColor"];
        destViewController.clientUrl = [NSURL URLWithString:[userInfo objectForKey:@"clientUrl"]];
        destViewController.clientName = [userInfo objectForKey:@"clientName"];
        [self.navigationController pushViewController:destViewController animated:YES];
    } else if ([[notification name] isEqualToString:@"didReceiveRemoteNotification"]){
        MessagesViewController *messages = [self.storyboard instantiateViewControllerWithIdentifier:@"messages"];
        [self.navigationController pushViewController:messages animated:YES];
    }
}

- (void)dealloc{
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:@"didReceiveLocalNotification"
                                                  object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:@"didReceiveRemoteNotification"
                                                  object:nil];
}

- (void)startStandardUpdates{
    //CLLocationManager *locationManager;
    if (nil == _locationManager)
        _locationManager = [[CLLocationManager alloc] init];
    _locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
    _locationManager.delegate = self;
    [_locationManager startUpdatingLocation];
    
    CLLocation *location = [_locationManager location];
    _latitude = [[NSNumber numberWithDouble:location.coordinate.latitude] stringValue];
    _longitude = [[NSNumber numberWithDouble:location.coordinate.longitude] stringValue];
    [_locationManager stopUpdatingLocation];
    [self updateMap:location.coordinate];
    [self getClosestLocations:_latitude longitue:_longitude];
}

-(void) viewWillAppear:(BOOL)animated{
    self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:140/255.0 green:197/255.0 blue:65/255.0 alpha:1.0];
}

- (void)getClosestLocations: (NSString*) latitude longitue:(NSString*) longitude{
     NSURLSession *session = [NSURLSession sharedSession];
     NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/GetClosestLocations/%@/%@", _userId, latitude, longitude];
     //NSLog(@"URL: %@", url);
     NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
         dispatch_async(dispatch_get_main_queue(), ^{
             if (error != nil) {
                 NSLog(@"Not connected to Internet");
                     UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Near" message:@"No se pudo conectar con el servidor. Intenta más tarde." delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
                     [alert show];
             } else {
                 _locationsArray = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                 if ([_locationsArray count] != 0) {
                     [self addAnnotations];
                 } else {
                     UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Near" message:@"Por el momento no hay lugares participantes." delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
                     [alert show];
                 }
             }
        });
     }];
     [dataTask resume];
}

-(void)updateMap:(CLLocationCoordinate2D) userLocation{
    _mapView.centerCoordinate = userLocation;
    MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance (userLocation, 10000, 10000);
    [_mapView setRegion:region animated:YES];

}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)mapView:(MKMapView *)mapView didUpdateUserLocation: (MKUserLocation *)userLocation{
}

- (void)mapView:(MKMapView *)mapView didFailToLocateUserWithError:(NSError *)error{
    /*
    NSLog(@"Not connected to Internet");
    dispatch_async(dispatch_get_main_queue(), ^{
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Internet" message:@"No se pudo conectar con el servidor. Intenta más tarde" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
        [alert show];
    });
    */
}

- (void)addAnnotations{
    for (id array in _locationsArray){
        CLLocationDegrees lat = [[array objectForKey:@"Latitude"] doubleValue];
        CLLocationDegrees lon = [[array objectForKey:@"Longitude"] doubleValue];
        
        MKPointAnnotation *point = [[MKPointAnnotation alloc] init];
        point.coordinate = CLLocationCoordinate2DMake(lat, lon);
        point.title = [array objectForKey:@"Name"];
        [self.mapView addAnnotation:point];
    }
}

- (MKAnnotationView *)mapView:(MKMapView *)mapView viewForAnnotation:(id <MKAnnotation>)annotation
{
    if ([annotation isKindOfClass:[MKUserLocation class]])
        return nil;
    
    MKAnnotationView* annotationView = [[MKPinAnnotationView alloc] initWithAnnotation:annotation
                                                                       reuseIdentifier:@"MyCustomAnnotation"];
    
    annotationView.canShowCallout = YES;
    annotationView.rightCalloutAccessoryView = [UIButton buttonWithType:UIButtonTypeDetailDisclosure];
    
    return annotationView;
}

- (void)mapView:(MKMapView *)mapView annotationView:(MKAnnotationView *)view calloutAccessoryControlTapped:(UIControl *)control
{
    id <MKAnnotation> annotation = view.annotation;
    CLLocationCoordinate2D coordinate = [annotation coordinate];
    MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:coordinate addressDictionary:nil];
    MKMapItem *mapitem = [[MKMapItem alloc] initWithPlacemark:placemark];
    mapitem.name = annotation.title;
    [mapitem openInMapsWithLaunchOptions:@{MKLaunchOptionsDirectionsModeKey:MKLaunchOptionsDirectionsModeDriving}];
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
