//
//  SidebarViewController.m
//  near
//
//  Created by Daniel Fernandez on 3/26/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "SidebarViewController.h"
#import "SWRevealViewController.h"
#import "CouponsAppDelegate.h"
#import <SDWebImage/UIImageView+WebCache.h>
#import "FriendActivityViewController.h"
#import "LoginViewController.h"

@interface SidebarViewController ()

@end

@implementation SidebarViewController

- (id)initWithStyle:(UITableViewStyle)style
{
    self = [super initWithStyle:style];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    // Uncomment the following line to preserve selection between presentations.
    // self.clearsSelectionOnViewWillAppear = NO;
    
    // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
    // self.navigationItem.rightBarButtonItem = self.editButtonItem;
    NSDate *date = [NSDate date];
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"ZZZZZ"];
    _timeZone = [[dateFormat stringFromDate:date] stringByReplacingOccurrencesOfString:@":" withString:@""];
    
    CouponsAppDelegate *appdelegate = (CouponsAppDelegate *)[[UIApplication sharedApplication] delegate];
    _userId = appdelegate.userId;
    _userName = appdelegate.userName;
    
    NSString *url = [NSString stringWithFormat:@"https://graph.facebook.com/%@/picture?width=80&height=80", _userId];
    [_userImage setImageWithURL:[NSURL URLWithString:url]];
    _userImage.layer.cornerRadius = _userImage.frame.size.height /2;
    _userImage.layer.masksToBounds = YES;
    _userImage.layer.borderWidth = 0;
    
    _userLabel.text = _userName;
    
    
    [self updateUnreadMessages];
}

- (void)viewDidAppear:(BOOL)animated{
    [self updateUnreadMessages];
}

/*
- (void)updateUnreadMessages{
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/%@/GetUnreadMessages", _userId, _timeZone];
    NSData *offers = [[NSData alloc] initWithContentsOfURL:[NSURL URLWithString:url]];
    NSError *error;
    NSArray *response = [NSJSONSerialization
                    JSONObjectWithData:offers
                    options:NSJSONReadingMutableContainers
                    error:&error];
    NSInteger unread = [[[response objectAtIndex:0] objectForKey:@"State"] integerValue];
    if (unread > 0) {
        _messagesLabel.text = [NSString stringWithFormat:@"Mensajes (%i)", unread];
    } else {
        _messagesLabel.text = [NSString stringWithFormat:@"Mensajes"];
    }
}
*/

-(void)updateUnreadMessages{
    NSURLSession *session = [NSURLSession sharedSession];
    NSString *url = [NSString stringWithFormat:@"http://api.descubrenear.com/%@/%@/GetUnreadMessages", _userId, _timeZone];
    NSURLSessionDataTask *dataTask = [session dataTaskWithURL:[NSURL URLWithString:url] completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        
        if(data)
        {
            NSArray *messages = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
        
            NSInteger unread = 0;
        
            if([messages count])
            {
                unread = [[[messages objectAtIndex:0] objectForKey:@"State"] integerValue];
            }
        
            if (unread > 0)
            {
                _messagesLabel.text = [NSString stringWithFormat:@"Mensajes (%i)", unread];
            }
            else
            {
                _messagesLabel.text = [NSString stringWithFormat:@"Mensajes"];
            }
        }
        else
        {
            _messagesLabel.text = [NSString stringWithFormat:@"Mensajes"];
        }
    }];
    [dataTask resume];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    if (indexPath.row == 5) {
        NSString *subject = [NSString stringWithFormat:@"Contacto"];
        NSString *mail = [NSString stringWithFormat:@"contacto@descubrenear.com"];
        NSURL *url = [[NSURL alloc] initWithString:[NSString stringWithFormat:@"mailto:?to=%@&subject=%@",
                                                    [mail stringByAddingPercentEscapesUsingEncoding:NSASCIIStringEncoding],
                                                    [subject stringByAddingPercentEscapesUsingEncoding:NSASCIIStringEncoding]]];
        [[UIApplication sharedApplication] openURL:url];
        
    } else if (indexPath.row == 6){
        [FBSession.activeSession closeAndClearTokenInformation];
        [self dismissViewControllerAnimated:YES completion:nil];
    }
    [self.tableView deselectRowAtIndexPath:indexPath animated:YES];
}

- (void) prepareForSegue: (UIStoryboardSegue *) segue sender: (id) sender{
    if ( [segue isKindOfClass: [SWRevealViewControllerSegue class]] ) {
        SWRevealViewControllerSegue *swSegue = (SWRevealViewControllerSegue*) segue;
        
        swSegue.performBlock = ^(SWRevealViewControllerSegue* rvc_segue, UIViewController* svc, UIViewController* dvc) {
            
            UINavigationController* navController = (UINavigationController*)self.revealViewController.frontViewController;
            [navController setViewControllers: @[dvc] animated: NO ];
            [self.revealViewController setFrontViewPosition: FrontViewPositionLeft animated: YES];
        };
        if ([segue.identifier isEqualToString:@"friendActivity"]) {
            FriendActivityViewController *friendVC = [segue destinationViewController];
            NSString * url = [NSString stringWithFormat:@"https://graph.facebook.com/%@/picture?width=128&height=128", _userId];
            friendVC.friendName = _userName;
            friendVC.imageUrl = [NSURL URLWithString:url];
            friendVC.userId = _userId;
            friendVC.friendId = _userId;
            friendVC.fromSidebar = TRUE;
        }
    }
}

@end
