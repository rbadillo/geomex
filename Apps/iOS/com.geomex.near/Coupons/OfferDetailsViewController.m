//
//  OfferDetailsViewController.m
//  near
//
//  Created by Daniel Fernandez on 3/10/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "OfferDetailsViewController.h"
#import <SDWebImage/UIImageView+WebCache.h>

@interface OfferDetailsViewController ()

@end

@implementation OfferDetailsViewController

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
    
    UIImageView* backView = [[UIImageView alloc] initWithFrame:self.view.frame];
    backView.frame = CGRectMake(backView.frame.origin.x, 0, backView.frame.size.width, backView.frame.size.height);
    backView.image = _imageOfUnderlyingView;
    backView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.4];
    [self.view addSubview:backView];
    [self.view sendSubviewToBack:backView];
	// Do any additional setup after loading the view.
    
    //Init latitude and longitude and call Location Update
    _latitude = @"null";
    _longitude = @"null";
    [self startStandardUpdates];
    
    NSDate *date = [NSDate date];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"ZZZZZ"];
    _timeZone = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
    
    _buttonState = FALSE;
    
    [self getOfferData];
}

- (void)startStandardUpdates{
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
- (void)locationManager:(CLLocationManager *)manager
     didUpdateLocations:(NSArray *)locations {
    NSLog(@"Update location");
    // If it's a relatively recent event, turn off updates to save power.
    CLLocation* location = [locations lastObject];
    NSDate* eventDate = location.timestamp;
    NSTimeInterval howRecent = [eventDate timeIntervalSinceNow];
    if (abs(howRecent) < 15.0) {
        _latitude = [[NSNumber numberWithDouble:location.coordinate.latitude] stringValue];
        _longitude = [[NSNumber numberWithDouble:location.coordinate.longitude] stringValue];
        
    }
    [_locationManager stopUpdatingLocation];
}
*/

/*
- (void) getOfferData{
    //Call the API to get the data
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/%@/GetOffers/%@/OfferDetails/%@?latitude=%@&longitude=%@", _userId, _timeZone, _clientId, _offerId, _latitude, _longitude];
    NSLog(@"OfferDetails url: %@", url);
    NSData *details = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    _offerDetails = [NSJSONSerialization
                     JSONObjectWithData:details
                     options:NSJSONReadingMutableContainers
                     error:&error];
    if (error) {
        NSLog(@"Error getting offers details: %@", error);
    }
}
 */

-(void)getOfferData{
    UIActivityIndicatorView *activityView=[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle: UIActivityIndicatorViewStyleGray];
    activityView.center=self.view.center;
    [activityView startAnimating];
    [self.view addSubview:activityView];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/%@/GetOffers/%@/OfferDetails/%@?latitude=%@&longitude=%@", _userId, _timeZone, _clientId, _offerId, _latitude, _longitude];
    NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error != nil) {
            NSLog(@"Not connected to Internet");
            dispatch_async(dispatch_get_main_queue(), ^{
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Internet" message:@"No se pudo conectar con el servidor. Intenta más tarde" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
                [activityView stopAnimating];
                [alert show];
            });
        } else {
            dispatch_async(dispatch_get_main_queue(), ^{
                [activityView stopAnimating];
                NSHTTPURLResponse* httpResponse = (NSHTTPURLResponse*)response;
                if ([httpResponse statusCode] == 200) {
                    _offerDetails = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                    _redeem.hidden = NO;
                    _offerTitle.text = [[_offerDetails objectAtIndex:0] objectForKey:@"Title"];
                    _offerSubtitle.text = [[_offerDetails objectAtIndex:0] objectForKey:@"Subtitle"];
                    _instructions.text = [[_offerDetails objectAtIndex:0] objectForKey:@"Instructions"];
                    _disclaimer.text = [[_offerDetails objectAtIndex:0] objectForKey:@"Disclaimer"];
                    NSURL *url = [NSURL URLWithString:[[_offerDetails objectAtIndex:0] objectForKey:@"PrimaryImage"]];
                    [_offerImage setImageWithURL:url];
                    _offerImage.layer.cornerRadius = _offerImage.frame.size.height /2;
                    _offerImage.layer.masksToBounds = YES;
                    _offerImage.layer.borderWidth = 0;
                    
                } else {
                    //[_offerImage setFrame:CGRectMake(_offerImage.frame.origin.x, _offerImage.frame.origin.y + 200, _offerImage.frame.size.width, _offerImage.frame.size.height)];
                    [_offerImage setImage:[UIImage imageNamed:@"ic_about.png"]];
                    _errorLabel.text = @"Lo sentimos, esta oferta ya no está disponible.\n\n Uno de los siguientes eventos sucedió:\n\n A) La oferta ya fue canjeada.\n B) El número de ofertas disponibles se agotó.\n C)La oferta expiró.";
                }
            });
        }
    }];
    [dataTask resume];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)redeem:(id)sender {
    if (!_buttonState) {
        _buttonState = TRUE;
        NSString *text = [NSString stringWithFormat:@"Confirmar"];
        [_redeem setTitle:text forState:UIControlStateNormal];
    } else {
        //Call the API to get the data
        NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/%@/GetOffers/%@/Redeem/%@?latitude=%@&longitude=%@", _userId, _timeZone, _clientId, _offerId, _latitude, _longitude];
        NSData *details = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
        NSError *error;
        NSArray *redeemResponse = [NSJSONSerialization
                                   JSONObjectWithData:details
                                   options:NSJSONReadingMutableContainers
                                   error:&error];
        if (error) {
            NSLog(@"Error with redeem: %@", error);
        }
        
        NSString *code = [[redeemResponse objectAtIndex:0] objectForKey:@"Code"];
        NSDate *currentDate = [NSDate date];
        NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
        [dateFormat setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"es_MX"]];
        [dateFormat setDateFormat:@"dd-MMMM-YYYY HH:mm"];
        NSString *dateString = [dateFormat stringFromDate:currentDate];
        NSString *text = [NSString stringWithFormat:@"%@\n%@", code, dateString];
        _redeem.titleLabel.textAlignment = NSTextAlignmentCenter;
        _redeem.titleLabel.font = [UIFont systemFontOfSize:20];
        [_redeem setTitle:text forState:UIControlStateNormal];
        [_redeem setEnabled:NO];
        _buttonState = FALSE;
    }
}
@end
