//
//  UIView+convertViewToImage.m
//  near
//
//  Created by Daniel Fernandez on 4/14/14.
//  Copyright (c) 2014 Daniel. All rights reserved.
//

#import "UIView+convertViewToImage.h"

@implementation UIView (convertViewToImage)

-(UIImage *)convertViewToImage
{
    UIGraphicsBeginImageContext(self.bounds.size);
    [self drawViewHierarchyInRect:self.bounds afterScreenUpdates:YES];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return image;
}

@end
