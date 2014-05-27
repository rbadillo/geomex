//
//  SidebarViewController.h
//  near
//
//  Created by Daniel Fernandez on 3/26/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <FacebookSDK/FacebookSDK.h>

@interface SidebarViewController : UITableViewController <FBLoginViewDelegate>
@property (strong, nonatomic) NSString *timeZone;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *userName;
@property (strong, nonatomic) IBOutlet UILabel *messagesLabel;
@property (strong, nonatomic) IBOutlet UIImageView *userImage;
@property (strong, nonatomic) IBOutlet UILabel *userLabel;

@end
