//
//  FriendsViewController.h
//  near
//
//  Created by Daniel Fernandez on 4/1/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface FriendsViewController : UIViewController <NSURLConnectionDelegate>
@property (strong, nonatomic) IBOutlet UIBarButtonItem *sidebarButton;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) IBOutlet UITableView *tableView;
@property (strong, nonatomic) NSArray *friendsArray;
@end
