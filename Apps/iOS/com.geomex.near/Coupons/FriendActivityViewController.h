//
//  FriendActivityViewController.h
//  near
//
//  Created by Daniel Fernandez on 4/2/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface FriendActivityViewController : UIViewController
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *friendId;
@property (strong, nonatomic) IBOutlet UITableView *tableView;
@property (strong, nonatomic) NSArray *friendDataArray;
@property (strong, nonatomic) NSString *friendName;
@property (strong, nonatomic) NSURL *imageUrl;
@property (strong, nonatomic) IBOutlet UILabel *nameLabel;
@property (strong, nonatomic) IBOutlet UIImageView *friendImage;
@property BOOL fromSidebar;
@end
