//
//  Clients.h
//  near
//
//  Created by Daniel Fernandez on 3/2/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Clients : NSObject
@property (strong, nonatomic) NSString *clientId;
@property (strong, nonatomic) NSString *name;
@property (strong, nonatomic) NSURL *logo;
@property (assign, nonatomic) BOOL isGold;
@property (strong, nonatomic) NSDate *offerClosestExpiration;
@property (strong, nonatomic) NSString *clientHexColor;
@end
