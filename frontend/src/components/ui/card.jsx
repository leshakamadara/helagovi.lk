<<<<<<< HEAD
import * as React from "react"

import { cn } from "@/lib/utils"
=======
import * as React from 'react';

import { cn } from '@/lib/utils';
>>>>>>> feature/support-system

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props} />
))
Card.displayName = "Card"
=======
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';
>>>>>>> feature/support-system

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"
=======
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';
>>>>>>> feature/support-system

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"
=======
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';
>>>>>>> feature/support-system

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"
=======
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';
>>>>>>> feature/support-system

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
=======
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
>>>>>>> feature/support-system
