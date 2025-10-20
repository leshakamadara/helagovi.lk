<<<<<<< HEAD
import * as React from "react"

import { cn } from "../../lib/utils"
=======
import * as React from 'react';

import { cn } from '@/lib/utils';
>>>>>>> feature/support-system

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
<<<<<<< HEAD
      className={cn("w-full caption-bottom text-sm", className)}
      {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"
=======
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';
>>>>>>> feature/support-system

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
<<<<<<< HEAD
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props} />
))
TableBody.displayName = "TableBody"
=======
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';
>>>>>>> feature/support-system

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
<<<<<<< HEAD
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props} />
))
TableFooter.displayName = "TableFooter"
=======
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';
>>>>>>> feature/support-system

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
<<<<<<< HEAD
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props} />
))
TableRow.displayName = "TableRow"
=======
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';
>>>>>>> feature/support-system

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
<<<<<<< HEAD
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableHead.displayName = "TableHead"
=======
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';
>>>>>>> feature/support-system

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
<<<<<<< HEAD
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props} />
))
TableCell.displayName = "TableCell"
=======
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
>>>>>>> feature/support-system

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
<<<<<<< HEAD
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props} />
))
TableCaption.displayName = "TableCaption"
=======
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';
>>>>>>> feature/support-system

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
<<<<<<< HEAD
}
=======
};
>>>>>>> feature/support-system
