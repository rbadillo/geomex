//
//  FriendsViewController.m
//  near
//
//  Created by Daniel Fernandez on 4/1/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "FriendsViewController.h"
#import <FacebookSDK/FacebookSDK.h>
#import "SWRevealViewController.h"
#import "CouponsAppDelegate.h"
#import <SDWebImage/UIImageView+WebCache.h>
#import "FriendActivityViewController.h"
#import "OffersViewController.h"
#import "MessagesViewController.h"

@interface FriendsViewController (){
    NSMutableData *_responseData;
    UIActivityIndicatorView *activityView;
}
@end

@implementation FriendsViewController

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
    self.title = @"Mis amigos";
    
    CouponsAppDelegate *appdelegate = (CouponsAppDelegate *)[[UIApplication sharedApplication] delegate];
    _userId = appdelegate.userId;
    
    _sidebarButton.target = self.revealViewController;
    _sidebarButton.action = @selector(revealToggle:);
    
    // Set the gesture
    [self.view addGestureRecognizer:self.revealViewController.panGestureRecognizer];
    
    [self sendFriendList];
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
    self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:133/255.0 green:168/255.0 blue:25/255.0 alpha:1.0];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)sendFriendList {
    activityView=[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle: UIActivityIndicatorViewStyleGray];
    activityView.center=self.view.center;
    [activityView startAnimating];
    [self.view addSubview:activityView];
    
    if (FBSession.activeSession.isOpen) {
        //NSLog(@"FBSession is Open");
        FBRequest* friendsRequest = [FBRequest requestForMyFriends];
        [friendsRequest startWithCompletionHandler: ^(FBRequestConnection *connection,
                                                      NSDictionary* result,
                                                      NSError *error) {
            
            if (!error) {
                NSArray* friends = [result objectForKey:@"data"];
                NSMutableArray *list=[[NSMutableArray alloc] init];
                //NSLog(@"Found: %i friends", friends.count);
                for (NSDictionary<FBGraphUser>* friend in friends) {
                    [list addObject:friend.id];
                }
                NSMutableDictionary *Body=[[NSMutableDictionary alloc] init];
                [Body setObject:list forKey:@"friend_list"];
                
                NSError *error=nil;
                NSData *result=[NSJSONSerialization dataWithJSONObject:Body options:0 error:&error];
                NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/GetFriends", _userId];
                NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL: [NSURL URLWithString:url]];
                [request setHTTPMethod:@"POST"];
                [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
                [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
                [request setValue:[NSString stringWithFormat:@"%d",[result length]]forHTTPHeaderField:@"Content-Length"];
                [request setHTTPBody:result];
                
                NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request delegate:self];
                [connection start];
            } else {
                NSLog(@"Not connected to Internet");
                dispatch_async(dispatch_get_main_queue(), ^{
                    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Internet" message:@"No se pudo conectar con el servidor. Intenta más tarde" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
                    [alert show];
                    [activityView stopAnimating];
                });
            }
        }];
    }
}

#pragma mark NSURLConnection Delegate Methods

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {
    _responseData = [[NSMutableData alloc] init];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data {
    // Append the new data to the instance variable you declared
    [_responseData appendData:data];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
    _friendsArray = [NSJSONSerialization
                     JSONObjectWithData:_responseData
                     options:NSJSONReadingMutableContainers
                     error:nil];
    [activityView stopAnimating];
    dispatch_async(dispatch_get_main_queue(), ^{

        if ([_friendsArray count] == 0) {
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
        } else {
            [self.tableView reloadData];
        }
    });
}
- (void) connection:(NSURLConnection *)connection didFailWithError:(NSError *)error{
    NSLog(@"Not connected to Internet");
    dispatch_async(dispatch_get_main_queue(), ^{
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Internet" message:@"No se pudo conectar con el servidor. Intenta más tarde" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
        [alert show];
        [activityView stopAnimating];
    });
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return[_friendsArray count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *cellIdentifier = @"Cell";
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil){
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    }
    NSString *firstname = [[_friendsArray objectAtIndex:indexPath.row] objectForKey:@"FbName"];
    NSString *lastName= [[_friendsArray objectAtIndex:indexPath.row] objectForKey:@"FbLastName"];
    NSString *name = [NSString stringWithFormat:@"%@ %@", firstname, lastName];
    
    UIImageView *image = (UIImageView *)[cell viewWithTag:100];
    UILabel *title = (UILabel *)[cell viewWithTag:101];
    title.text = name;
    UIView *bgView = (UIView *)[cell viewWithTag:50];
    
    [bgView.layer setCornerRadius:7.0f];
    [bgView.layer setMasksToBounds:YES];
    
    NSURL *url = [NSURL URLWithString:[[_friendsArray objectAtIndex:indexPath.row] objectForKey: @"FbPhoto"]];
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
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender{
    FriendActivityViewController *friendVC = [segue destinationViewController];
    NSIndexPath *indexPath = [self.tableView indexPathForSelectedRow];
    NSString *firstname = [[_friendsArray objectAtIndex:indexPath.row] objectForKey:@"FbName"];
    NSString *lastName= [[_friendsArray objectAtIndex:indexPath.row] objectForKey:@"FbLastName"];
    NSURL *imageUrl = [NSURL URLWithString:[[_friendsArray objectAtIndex:indexPath.row] objectForKey: @"FbPhoto"]];
    NSString *name = [NSString stringWithFormat:@"%@ %@", firstname, lastName];
    friendVC.friendName = name;
    friendVC.imageUrl = imageUrl;
    //friendVC.title = name;
    friendVC.userId = _userId;
    friendVC.friendId = [[_friendsArray objectAtIndex:indexPath.row] objectForKey:@"UserId"];
    [self.tableView deselectRowAtIndexPath:indexPath animated:YES];
}


@end
