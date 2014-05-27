//
//  MessagesViewController.h
//  near
//
//  Created by Daniel Fernandez on 3/31/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MessagesViewController : UIViewController
@property (strong, nonatomic) NSString *timeZone;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSArray *messagesArray;
@property (strong, nonatomic) IBOutlet UITableView *tableView;
@property (strong, nonatomic) IBOutlet UIBarButtonItem *sidebarButton;

@end
