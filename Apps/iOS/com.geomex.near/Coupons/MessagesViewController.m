//
//  MessagesViewController.m
//  near
//
//  Created by Daniel Fernandez on 3/31/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "MessagesViewController.h"
#import "CouponsAppDelegate.h"
#import <SDWebImage/UIImageView+WebCache.h>
#import "SWRevealViewController.h"
#import "OffersViewController.h"

@interface MessagesViewController ()

@end

@implementation MessagesViewController

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
    self.title = @"Mensajes";
    _sidebarButton.target = self.revealViewController;
    _sidebarButton.action = @selector(revealToggle:);
    
    // Set the gesture
    [self.view addGestureRecognizer:self.revealViewController.panGestureRecognizer];
    
    CouponsAppDelegate *appdelegate = (CouponsAppDelegate *)[[UIApplication sharedApplication] delegate];
    _userId = appdelegate.userId;
    NSDate *date = [NSDate date];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"ZZZZZ"];
    _timeZone = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
    
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

-(void) viewWillAppear:(BOOL)animated{
    self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:140/255.0 green:197/255.0 blue:65/255.0 alpha:1.0];
    [self getMessages];
}

-(void)getMessages{
    UIActivityIndicatorView *activityView=[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle: UIActivityIndicatorViewStyleGray];
    activityView.center=self.view.center;
    [activityView startAnimating];
    [self.view addSubview:activityView];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/%@/GetMessages", _userId, _timeZone];
    NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error != nil) {
            NSLog(@"Not connected to Internet");
            dispatch_async(dispatch_get_main_queue(), ^{
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Near" message:@"No se pudo conectar con el servidor. Intenta más tarde." delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
                [activityView stopAnimating];
                [alert show];
            });
        } else {

            _messagesArray = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                [activityView stopAnimating];
                if ([_messagesArray count] == 0) {
                    UIView *view = [[UIView alloc] initWithFrame:self.view.frame];
                    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(view.center.x-80,view.center.y-250,200,48)];
                    [label setTextColor:[UIColor darkGrayColor]];
                    [label setNumberOfLines:2];
                    [label setTextAlignment:NSTextAlignmentCenter];
                    [label setFont:[UIFont systemFontOfSize:13]];
                    label.text = @"Por el momento, no hay contenido para mostrar.";
                    UIImageView *image = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"ic_about.png"]];
                    [image setFrame:CGRectMake(view.center.x-100, view.center.y-245, 40, 40)];
                    //[image setCenter:view.center];
                    [view addSubview:label];
                    [view addSubview:image];
                    [self.tableView removeFromSuperview];
                    [self.view addSubview:view];
                } else {
                    [self.tableView reloadData];
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

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    // Return the number of sections.
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    // Return the number of rows in the section.
    return[_messagesArray count];
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    NSString *yourText = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"Message"];
    return 40 + [self heightForText:yourText];
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
    UIImageView *image = (UIImageView *)[cell viewWithTag:100];
    UILabel *title = (UILabel *)[cell viewWithTag:101];
    UILabel *subtitle = (UILabel *)[cell viewWithTag:102];
    UILabel *expiredLabel = (UILabel *)[cell viewWithTag:103];
    UIView *bgView = (UIView *)[cell viewWithTag:50];

    [bgView.layer setCornerRadius:7.0f];
    [bgView.layer setMasksToBounds:YES];
    
    cell.backgroundColor = [UIColor clearColor];
    title.text = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"ClientName"];
    subtitle.text = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"Message"];
    subtitle.lineBreakMode = NSLineBreakByWordWrapping;
    subtitle.numberOfLines = 0;
    
    
    NSString *expiredDate = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"TimeCreated"];
    // Convert string to date object
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZ"];
    [dateFormat setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"es_MX"]];
    NSDate *date = [dateFormat dateFromString:expiredDate];
    // Convert date object to desired output format
    [dateFormat setDateFormat:@"dd/MMMM/YYYY"];
    //[dateFormat setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"es_MX"]];
    expiredDate = [dateFormat stringFromDate:date];
   
    expiredLabel.text = expiredDate;
    
    NSURL *url = [NSURL URLWithString:[[_messagesArray objectAtIndex:indexPath.row] objectForKey: @"Logo"]];
    [image setImageWithURL:url
          placeholderImage: [UIImage imageNamed:@"placeholder.png"]
                 completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType) {
                     [cell setNeedsLayout];
                 }];
    //If message is unred change the font
    BOOL read = [[[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"MessageRead"] boolValue];
    if (!read) {
        subtitle.font = [UIFont boldSystemFontOfSize:12];
    }
    return cell;
}

#pragma mark - Navigation

-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender{
    NSIndexPath *indexPath = [self.tableView indexPathForSelectedRow];
    OffersViewController *destViewController = [segue destinationViewController];
    destViewController.clientId = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"ClientId"];
    destViewController.userId = _userId;
    destViewController.clientName = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"ClientName"];
    destViewController.clientUrl = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"Logo"];
    destViewController.clientHexColor = [[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"ClientHexColor"];

    BOOL read = [[[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"MessageRead"] boolValue];
    if (!read) {
        [self readMessage:[[_messagesArray objectAtIndex:indexPath.row] objectForKey:@"MessageId"]];
    }
    [self.tableView deselectRowAtIndexPath:indexPath animated:YES];
}

-(void)readMessage:(NSString*)messageId{
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/ReadMessage/%@", _userId, messageId];
    //NSLog(@"%@", url);
    NSData *data = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    [NSJSONSerialization
     JSONObjectWithData:data
     options:NSJSONReadingMutableContainers
     error:&error];
}


@end
