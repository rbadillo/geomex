//
//  ActiveClientsViewController.m
//  near
//
//  Created by Daniel Fernandez on 3/1/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "ActiveClientsViewController.h"
#import "Clients.h"
#import "OffersViewController.h"
#import "CouponsAppDelegate.h"
#import <SDWebImage/UIImageView+WebCache.h>
#import "SWRevealViewController.h"
#import "MessagesViewController.h"
#import <QuartzCore/QuartzCore.h>


#import <ContextCore/QLContextCore.h>

#import "LoginViewController.h"

@interface ActiveClientsViewController ()

@end

@implementation ActiveClientsViewController
@synthesize allClientsArray;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
    }
    return self;
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
    } else if ([[notification name] isEqualToString:@"didEnterForeground"]){
        [self getActiveClients];
    }
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    _sidebarButton.target = self.revealViewController;
    _sidebarButton.action = @selector(revealToggle:);
    
    // Set the gesture
    [self.view addGestureRecognizer:self.revealViewController.panGestureRecognizer];
    
    
    CouponsAppDelegate *appdelegate = (CouponsAppDelegate *)[[UIApplication sharedApplication] delegate];
    _userId = appdelegate.userId;
    //[self getActiveClients];
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

-(void) viewDidAppear:(BOOL)animated{
    [self getActiveClients];
}

-(void) viewWillAppear:(BOOL)animated{
    self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:133/255.0 green:168/255.0 blue:25/255.0 alpha:1.0];
}

/*
-(void) getActiveClients{
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/GetAllActiveClients", _userId];
    NSData *clients = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    NSMutableArray *tempClients = [NSJSONSerialization
                                   JSONObjectWithData:clients
                                   options:NSJSONReadingMutableContainers
                                   error:&error];
    if (error) {
        NSLog(@"Error getting clients data: %@", error);
    } else {
        NSMutableArray *tempArreglo = [[NSMutableArray alloc] init];
        for(NSDictionary *obj in tempClients) {
            // Añadir objetos temporales al table view.
            Clients *temp = [[Clients alloc] init];
            temp.clientId = [obj objectForKey:@"ClientId"];
            temp.name = [obj objectForKey:@"Name"];
            temp.logo = [NSURL URLWithString:[obj objectForKey:@"Logo"]];
            temp.isGold = [[obj objectForKey:@"IsGold"] boolValue];
            [tempArreglo addObject:temp];
        }
        allClientsArray = tempArreglo;
    }
}
*/

-(void) getActiveClients{
    UIActivityIndicatorView *activityView=[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle: UIActivityIndicatorViewStyleGray];
    activityView.center=self.view.center;
    [activityView startAnimating];
    [self.view addSubview:activityView];
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSString *url = [NSString stringWithFormat:@"http://near.noip.me/%@/GetAllActiveClients", _userId];
    NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error != nil) {
            NSLog(@"Not connected to Internet");
            dispatch_async(dispatch_get_main_queue(), ^{
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Internet" message:@"No se pudo conectar con el servidor. Intenta más tarde" delegate:self cancelButtonTitle:@"Ok" otherButtonTitles:nil, nil];
                [activityView stopAnimating];
                [alert show];
            });
        } else {
            NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
            NSMutableArray *tempArreglo = [[NSMutableArray alloc] init];
            for(NSDictionary *obj in json) {
                // Añadir objetos temporales al table view.
                Clients *temp = [[Clients alloc] init];
                temp.clientId = [obj objectForKey:@"ClientId"];
                temp.name = [obj objectForKey:@"Name"];
                temp.logo = [NSURL URLWithString:[obj objectForKey:@"Logo"]];
                temp.isGold = [[obj objectForKey:@"IsGold"] boolValue];
                temp.clientHexColor = [obj objectForKey:@"ClientHexColor"];
                [tempArreglo addObject:temp];
            }
            allClientsArray = tempArreglo;
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if ([allClientsArray count] == 0) {
                    UIView *view = [[UIView alloc] initWithFrame:self.collectionView.frame];
                    [view setBackgroundColor:[UIColor whiteColor]];
                    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(70,170,200,48)];
                    [label setTextColor:[UIColor darkGrayColor]];
                    [label setNumberOfLines:2];
                    [label setTextAlignment:NSTextAlignmentCenter];
                    [label setFont:[UIFont systemFontOfSize:13]];
                    label.text = @"Por el momento, no hay contenido para mostrar.";
                    UIImageView *image = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"ic_about.png"]];
                    [image setFrame:CGRectMake(50, 175, 40, 40)];
                    //[image setCenter:view.center];
                    [view addSubview:label];
                    [view addSubview:image];
                    //[self.collectionView removeFromSuperview];
                    [self.view addSubview:view];
                    
                    UIView *header = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 320, 53 )];
                    header.backgroundColor = [UIColor colorWithRed:133/255.0 green:168/255.0 blue:25/255.0 alpha:1.0];
                    UIImageView *userImage = [[UIImageView alloc] initWithFrame:CGRectMake(114, 15, 92, 23)];
                    [userImage setContentMode:UIViewContentModeScaleAspectFit];
                    userImage.image = [UIImage imageNamed:@"ic_near_text.png"];
                    [header addSubview:userImage];
                    [self.view addSubview:header];
                } else {
                    [self.collectionView reloadData];
                }
                [activityView stopAnimating];
            });
        }
    }];
    [dataTask resume];
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return [allClientsArray count];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath{
    //Create temporal client object
    Clients *tempClient = [self.allClientsArray objectAtIndex:indexPath.row];
    
    //Create or deque new cell
    static NSString *identifier = @"Cell";
    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:identifier forIndexPath: indexPath];
    
    [cell.layer setCornerRadius:7.0f];
    [cell.layer setMasksToBounds:YES];
    
    //Get the image and assign to cell
    UIImageView *clientImageView = (UIImageView *)[cell viewWithTag:100];
    [clientImageView setImageWithURL:tempClient.logo];
    /*
    clientImageView.layer.cornerRadius = clientImageView.frame.size.height /2;
    clientImageView.layer.masksToBounds = YES;
    clientImageView.layer.borderWidth = 0;
    */
    
    //Get the name and assign
    UILabel *nameLabel = (UILabel *)[cell viewWithTag:50];
    nameLabel.text = tempClient.name;
    
    UILabel *destacado = (UILabel *)[cell viewWithTag:75];
    
    //If client is gold change the background
    if (tempClient.isGold) {
        destacado.hidden = NO;
        destacado.text = @"\u2605 Destacado";
    } else {
        destacado.hidden = YES;
    }
    
    return cell;
}

- (UICollectionReusableView *)collectionView:(UICollectionView *)collectionView viewForSupplementaryElementOfKind:(NSString *)kind atIndexPath:(NSIndexPath *)indexPath{
    UICollectionReusableView *headerView = [collectionView dequeueReusableSupplementaryViewOfKind:UICollectionElementKindSectionHeader withReuseIdentifier:@"HeaderView" forIndexPath:indexPath];
    headerView.backgroundColor = [UIColor colorWithRed:133/255.0 green:168/255.0 blue:25/255.0 alpha:1.0];
    UIImageView *headerImage = (UIImageView *)[headerView viewWithTag:20];
    headerImage.image = [UIImage imageNamed:@"ic_near_text.png"];

    return headerView;
}

-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender{
    NSArray *indexPaths = [self.collectionView indexPathsForSelectedItems];
    OffersViewController *destViewController = [segue destinationViewController];
    NSIndexPath *indexPath = [indexPaths objectAtIndex:0];
    //NSLog(@"Client id: %@", [[allClientsArray objectAtIndex:indexPath.row] clientID]);
    destViewController.clientId = [[allClientsArray objectAtIndex:indexPath.row] clientId];
    destViewController.userId = _userId;
    destViewController.clientName = [[allClientsArray objectAtIndex:indexPath.row] name];
    destViewController.clientUrl = [[allClientsArray objectAtIndex:indexPath.row] logo];
    destViewController.clientHexColor = [[allClientsArray objectAtIndex:indexPath.row] clientHexColor];
    
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)dealloc{
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:@"didReceiveLocalNotification"
                                                  object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:@"didReceiveRemoteNotification"
                                                object:nil];
}
@end
