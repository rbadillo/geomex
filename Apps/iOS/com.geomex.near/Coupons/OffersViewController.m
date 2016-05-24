//
//  ClientDetailViewController.m
//  near
//
//  Created by Daniel Fernandez on 3/2/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "OffersViewController.h"
#import <SDWebImage/UIImageView+WebCache.h>
#import "OfferDetailsViewController.h"
#import "ActiveClientsViewController.h"
#import "UIView+convertViewToImage.h"
#import "UIImage+ImageEffects.h"

@interface OffersViewController ()

@end

@implementation OffersViewController

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
    [_headerView setBackgroundColor:[self colorWithHexString:_clientHexColor]];
    self.navigationController.navigationBar.barTintColor = [self colorWithHexString:_clientHexColor];
    NSDate *date = [NSDate date];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"ZZZZZ"];
    _timeZone = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
    _clientTitle.text = [_clientName uppercaseString];
    [_clientImage setImageWithURL:_clientUrl];
    //[self getOffersData];
    _latitude = @"null";
    _longitude = @"null";
    [self startStandardUpdates];
}

-(UIColor*)colorWithHexString:(NSString*)hex
{
    hex = [hex stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSString *cString = [[hex stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
    
    // String should be 6 or 8 characters
    if ([cString length] < 6) return [UIColor grayColor];
    
    // strip 0X if it appears
    if ([cString hasPrefix:@"0X"]) cString = [cString substringFromIndex:2];
    
    if ([cString length] != 6) return  [UIColor grayColor];
    
    // Separate into r, g, b substrings
    NSRange range;
    range.location = 0;
    range.length = 2;
    NSString *rString = [cString substringWithRange:range];
    
    range.location = 2;
    NSString *gString = [cString substringWithRange:range];
    
    range.location = 4;
    NSString *bString = [cString substringWithRange:range];
    
    // Scan values
    unsigned int r, g, b;
    [[NSScanner scannerWithString:rString] scanHexInt:&r];
    [[NSScanner scannerWithString:gString] scanHexInt:&g];
    [[NSScanner scannerWithString:bString] scanHexInt:&b];
    
    return [UIColor colorWithRed:((float) r / 255.0f)
                           green:((float) g / 255.0f)
                            blue:((float) b / 255.0f)
                           alpha:1.0f];
}

-(void) viewDidAppear:(BOOL)animated{
    [self getOffersData];
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

-(void)getOffersData{
    UIActivityIndicatorView *activityView=[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle: UIActivityIndicatorViewStyleGray];
    activityView.center=self.view.center;
    [activityView startAnimating];
    [self.view addSubview:activityView];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/%@/GetOffers/%@?latitude=%@&longitude=%@", _userId, _timeZone, _clientId, _latitude, _longitude];
    NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error != nil) {
            NSLog(@"Not connected to Internet");
            dispatch_async(dispatch_get_main_queue(), ^{
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Near" message:@"No se pudo conectar con el servidor. Intenta más tarde." delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
                [activityView stopAnimating];
                [alert show];
            });
        } else {
            _offersArray = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if ([_offersArray count] == 0) {
                    UIView *view = [[UIView alloc] initWithFrame:self.view.frame];
                    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(70,100,200,48)];
                    [label setTextColor:[UIColor darkGrayColor]];
                    [label setNumberOfLines:2];
                    [label setTextAlignment:NSTextAlignmentCenter];
                    [label setFont:[UIFont systemFontOfSize:13]];
                    label.text = @"Por el momento, no hay contenido para mostrar.";
                    UIImageView *image = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"ic_about.png"]];
                    [image setFrame:CGRectMake(50, 105, 40, 40)];
                    //[image setCenter:view.center];
                    [view addSubview:label];
                    [view addSubview:image];
                    [self.tableView removeFromSuperview];
                    [self.view addSubview:view];
                    
                    CGFloat screenWidth = [UIScreen mainScreen].bounds.size.width;
                    UIView *header = [[UIView alloc] initWithFrame:CGRectMake(0, 0, screenWidth, 53 )];
                    [header setBackgroundColor:[self colorWithHexString:_clientHexColor]];
                    UIImageView *clientImage = [[UIImageView alloc] initWithFrame:CGRectMake(80, 4, 45, 45)];
                    [clientImage setContentMode:UIViewContentModeScaleAspectFit];
                    [clientImage setImageWithURL:_clientUrl];
                    UILabel *clientName = [[UILabel alloc] initWithFrame:CGRectMake(132, 27, 116, 21)];
                    clientName.text = [_clientName uppercaseString];
                    
                    [clientName setTextColor:[UIColor whiteColor]];
                    [clientName setFont:[UIFont boldSystemFontOfSize:15]];
                    UILabel *offer = [[UILabel alloc] initWithFrame:CGRectMake(132, 6, 59, 21)];
                    offer.text = @"Ofertas";
                    [offer setTextColor:[UIColor whiteColor]];
                    [offer setFont:[UIFont systemFontOfSize:16]];
                    [header addSubview:clientImage];
                    [header addSubview:clientName];
                    [header addSubview:offer];
                    [self.view addSubview:header];
                } else {
                    [self.tableView reloadData];
                }
                [activityView stopAnimating];
            });
        }
    }];
    [dataTask resume];
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSString *yourText = [[_offersArray objectAtIndex:indexPath.row] objectForKey:@"Title"];
    return 60 + [self heightForText:yourText];
}

-(CGFloat)heightForText:(NSString *)text
{
    NSInteger MAX_HEIGHT = 2000;
    UITextView * textView = [[UITextView alloc] initWithFrame: CGRectMake(0, 0, 197, MAX_HEIGHT)];
    textView.text = text;
    textView.font = [UIFont systemFontOfSize:12];
    [textView sizeToFit];
    return textView.frame.size.height;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    static NSString *cellIdentifier = @"CustomCell";    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil){
            cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    }
    
    NSString *endDateString = [[_offersArray objectAtIndex:indexPath.row] objectForKey:@"EndDate"];
    NSString *startDateString = [[_offersArray objectAtIndex:indexPath.row] objectForKey:@"StartDate"];
    // Convert string to date object
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZ"];
    [dateFormat setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"es_MX"]];
    NSDate *endDate = [dateFormat dateFromString:endDateString];
    NSDate *startDate = [dateFormat dateFromString:startDateString];
    // Convert date object to desired output format
    [dateFormat setDateFormat:@"MMMM dd, YYYY HH:mm"];
    //[dateFormat setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"es_MX"]];
    endDateString = [dateFormat stringFromDate:endDate];
    startDateString = [dateFormat stringFromDate:startDate];
    
    UIImageView *image = (UIImageView *)[cell viewWithTag:100];
    UILabel *title = (UILabel *)[cell viewWithTag:101];
    UILabel *subtitle = (UILabel *)[cell viewWithTag:102];
    UILabel *expireDate = (UILabel *)[cell viewWithTag:103];
    UILabel *destacado = (UILabel *)[cell viewWithTag:104];
    UIView *bgView = (UIView *) [cell viewWithTag:50];
    title.text = [[_offersArray objectAtIndex:indexPath.row] objectForKey:@"Title"];
    title.lineBreakMode = NSLineBreakByWordWrapping;
    title.numberOfLines = 0;
    subtitle.text = [[_offersArray objectAtIndex:indexPath.row] objectForKey:@"Subtitle"];
    subtitle.lineBreakMode = NSLineBreakByWordWrapping;
    subtitle.numberOfLines = 0;
    
    //If start date is in the future, mark and disable interaction
    NSDate *currentDate = [NSDate date];
    if ([startDate compare:currentDate] == NSOrderedDescending) {
        bgView.backgroundColor = [UIColor lightGrayColor];
        cell.userInteractionEnabled = NO;
        expireDate.text = [NSString stringWithFormat:@"A partir de %@", startDateString];
    } else {
        //cell.backgroundColor = [UIColor colorWithRed:240 green:240 blue:240 alpha:1];
        cell.userInteractionEnabled = YES;
        expireDate.text = [NSString stringWithFormat:@"Hasta %@", endDateString];
    }
    
    
    NSURL *url = [NSURL URLWithString:[[_offersArray objectAtIndex:indexPath.row] objectForKey: @"PrimaryImage"]];
    [image setImageWithURL:url
          placeholderImage: [UIImage imageNamed:@"placeholder.png"]
                 completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType) {
                     [cell setNeedsLayout];
                 }];
    image.layer.cornerRadius = image.frame.size.height /2;
    image.layer.masksToBounds = YES;
    image.layer.borderWidth = 0;
    
    [bgView.layer setCornerRadius:7.0f];
    [bgView.layer setMasksToBounds:YES];
    
    
    //If offer is gold change the background
    BOOL isPrivate = [[[_offersArray objectAtIndex:indexPath.row] objectForKey:@"IsPrivate"] boolValue];
    if (isPrivate) {
        destacado.text = @"\u2605 Destacado";
        destacado.hidden = NO;
    } else {
        destacado.hidden = YES;
    }
    return cell;
    
}

- (NSString *)applyTimezoneFixForDate:(NSString *)date {
    NSRange colonRange = [date rangeOfCharacterFromSet:[NSCharacterSet characterSetWithCharactersInString: @":"] options:NSBackwardsSearch];
    return [date stringByReplacingCharactersInRange:colonRange withString:@""];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return [_offersArray count];
}

-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender{
    OfferDetailsViewController *destViewController = [segue destinationViewController];
    NSIndexPath *indexPath = [self.tableView indexPathForSelectedRow];
    destViewController.clientId = _clientId;
    destViewController.userId = _userId;
    destViewController.offerId = [[_offersArray objectAtIndex:indexPath.row] objectForKey:@"OfferId"];
    [self.tableView deselectRowAtIndexPath:indexPath animated:YES];

    UIImage *imageOfUnderlyingView = [self.view convertViewToImage];
    imageOfUnderlyingView = [imageOfUnderlyingView applyBlurWithRadius:20
                                                             tintColor:[UIColor colorWithWhite:1.0 alpha:0.2]
                                                 saturationDeltaFactor:1.3
                                                             maskImage:nil];
    destViewController.imageOfUnderlyingView = imageOfUnderlyingView;
}

 
- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
@end
