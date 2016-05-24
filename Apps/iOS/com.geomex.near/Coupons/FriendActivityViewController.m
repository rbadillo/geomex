//
//  FriendActivityViewController.m
//  near
//
//  Created by Daniel Fernandez on 4/2/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "FriendActivityViewController.h"
#import "SDWebImage/UIImageView+WebCache.h"
#import "OfferDetailsViewController.h"
#import "SWRevealViewController.h"
#import "UIView+convertViewToImage.h"
#import "UIImage+ImageEffects.h"

@interface FriendActivityViewController ()

@end

@implementation FriendActivityViewController

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
    _nameLabel.text = _friendName;
    [_friendImage setImageWithURL:_imageUrl];
    _friendImage.layer.cornerRadius = _friendImage.frame.size.height /2;
    _friendImage.layer.masksToBounds = YES;
    _friendImage.layer.borderWidth = 0;
    [self getFriendActivity];
}

- (void) viewWillAppear:(BOOL)animated{
    if (_fromSidebar) {
        UIBarButtonItem *menu = [[UIBarButtonItem alloc] initWithTitle:@"Menu" style:UIBarButtonItemStyleBordered target:self.revealViewController action:@selector(revealToggle:)];
        [menu setImage:[UIImage imageNamed:@"menu.png"]];
        //NSArray *items = [NSArray arrayWithObjects:menu, nil];
        self.navigationItem.leftBarButtonItem = menu;
        // Set the gesture
        [self.view addGestureRecognizer:self.revealViewController.panGestureRecognizer];
    }
        self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:59/255.0 green:89/255.0 blue:152/255.0 alpha:1.0];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(void)getFriendActivity{
    UIActivityIndicatorView *activityView=[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle: UIActivityIndicatorViewStyleGray];
    activityView.center=self.view.center;
    [activityView startAnimating];
    [self.view addSubview:activityView];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/GetFriendActivity/%@", _userId, _friendId];
    NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        
        
        if(data)
        {
            _friendDataArray = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
        }
        else
        {
            _friendDataArray = @[];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
            [activityView stopAnimating];
            if ([_friendDataArray count] == 0) {
                /*
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Actividad reciente" message:@"Por el momento no hay contenido para mostrar" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
                [alert show];
                */
                CGFloat screenWidth = [UIScreen mainScreen].bounds.size.width;
                CGFloat headerHeight = 53;
                UIView *view = [[UIView alloc] initWithFrame:self.view.frame];
                UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(view.center.x-80,view.center.y-250 + headerHeight,200,48)];
                [label setTextColor:[UIColor darkGrayColor]];
                [label setNumberOfLines:2];
                [label setTextAlignment:NSTextAlignmentCenter];
                [label setFont:[UIFont systemFontOfSize:13]];
                label.text = @"Por el momento, no hay contenido para mostrar.";
                UIImageView *image = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"ic_about.png"]];
                [image setFrame:CGRectMake(view.center.x-100, view.center.y-245+headerHeight, 40, 40)];
                //[image setCenter:view.center];
                [view addSubview:label];
                [view addSubview:image];
                [self.tableView removeFromSuperview];
                [self.view addSubview:view];
                
                
                UIView *header = [[UIView alloc] initWithFrame:CGRectMake(0, 0, screenWidth, 53 )];
                [header setBackgroundColor:[UIColor colorWithRed:59/255.0 green:89/255.0 blue:152/255.0 alpha:1.0]];
                UIImageView *userImage = [[UIImageView alloc] initWithFrame:CGRectMake(80, 4, 45, 45)];
                [userImage setContentMode:UIViewContentModeScaleAspectFit];
                [userImage setImageWithURL:_imageUrl];
                UILabel *userName = [[UILabel alloc] initWithFrame:CGRectMake(132, 27, 136, 21)];
                userName.text = _friendName;
                [userName setTextColor:[UIColor whiteColor]];
                [userName setFont:[UIFont boldSystemFontOfSize:15]];
                UILabel *titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(132, 6, 136, 21)];
                titleLabel.text = @"Actividad Reciente";
                [titleLabel setTextColor:[UIColor whiteColor]];
                [titleLabel setFont:[UIFont systemFontOfSize:16]];
                [header addSubview:userImage];
                [header addSubview:userName];
                [header addSubview:titleLabel];
                [self.view addSubview:header];
            } else {
                [self.tableView reloadData];
            }
        });
        
    }];
    [dataTask resume];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    return[_friendDataArray count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *cellIdentifier = @"CustomCell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil){
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    }
    UIImageView *image = (UIImageView *)[cell viewWithTag:100];
    UILabel *title = (UILabel *)[cell viewWithTag:101];
    UILabel *subtitle = (UILabel *)[cell viewWithTag:102];
    UILabel *expireDate = (UILabel *)[cell viewWithTag:103];
    UILabel *client = (UILabel *)[cell viewWithTag:104];
    UIView *bgView = (UIView *)[cell viewWithTag:50];
    
    [bgView.layer setCornerRadius:7.0f];
    [bgView.layer setMasksToBounds:YES];
    
    NSString *expiredDate = [[_friendDataArray objectAtIndex:indexPath.row] objectForKey:@"TimeCreated"];
    // Convert string to date object
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZ"];
    [dateFormat setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"es_MX"]];
    NSDate *date = [dateFormat dateFromString:expiredDate];
    // Convert date object to desired output format
    [dateFormat setDateFormat:@"MMMM dd YYYY"];
    expiredDate = [dateFormat stringFromDate:date];
    
    expireDate.text = [NSString stringWithFormat:@"Canjeado %@", expiredDate];
    
    title.text = [[_friendDataArray objectAtIndex:indexPath.row] objectForKey:@"Title"];
    subtitle.text = [[_friendDataArray objectAtIndex:indexPath.row] objectForKey:@"Subtitle"];
    client.text = [[_friendDataArray objectAtIndex:indexPath.row] objectForKey:@"ClientName"];
    
    NSURL *url = [NSURL URLWithString:[[_friendDataArray objectAtIndex:indexPath.row] objectForKey: @"PrimaryImage"]];
    [image setImageWithURL:url
          placeholderImage: [UIImage imageNamed:@"placeholder.png"]
                 completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType) {
                     [cell setNeedsLayout];
                 }];
    image.layer.cornerRadius = image.frame.size.height /2;
    image.layer.masksToBounds = YES;
    image.layer.borderWidth = 0;
    
    return cell;
}

#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender{
    OfferDetailsViewController *destViewController = [segue destinationViewController];
    NSIndexPath *indexPath = [_tableView indexPathForSelectedRow];
    destViewController.clientId = [[_friendDataArray objectAtIndex:indexPath.row] objectForKey:@"ClientId"];
    destViewController.userId = _userId;
    destViewController.offerId = [[_friendDataArray objectAtIndex:indexPath.row] objectForKey:@"OfferId"];
    [self.tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    UIImage *imageOfUnderlyingView = [self.view convertViewToImage];
    imageOfUnderlyingView = [imageOfUnderlyingView applyBlurWithRadius:20
                                                             tintColor:[UIColor colorWithWhite:1.0 alpha:0.2]
                                                 saturationDeltaFactor:1.3
                                                             maskImage:nil];
    destViewController.imageOfUnderlyingView = imageOfUnderlyingView;
}
@end
