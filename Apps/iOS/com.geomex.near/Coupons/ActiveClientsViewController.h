//
//  ActiveClientsViewController.h
//  near
//
//  Created by Daniel Fernandez on 3/1/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <UIKit/UIKit.h>
@interface ActiveClientsViewController : UICollectionViewController

@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSArray *allClientsArray;
@property (strong, nonatomic) IBOutlet UIBarButtonItem *sidebarButton;

@end
