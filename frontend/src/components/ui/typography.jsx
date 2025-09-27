import { cn } from "../../lib/utils"

export function Typography({ 
  variant = "p", 
  size,
  className, 
  children, 
  ...props 
}) {
  const variants = {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight",
    p: "leading-7 [&:not(:first-child)]:mt-6",
    blockquote: "mt-6 border-l-2 pl-6 italic",
    table: "my-6 w-full overflow-y-auto",
    list: "my-6 ml-6 list-disc [&>li]:mt-2",
    code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    lead: "text-xl text-muted-foreground",
    large: "text-lg font-semibold",
    small: "text-sm font-medium leading-none",
    muted: "text-sm text-muted-foreground",
  }

  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg", 
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
  }

  const Component = variant === 'blockquote' ? 'blockquote' : 
                   variant === 'code' ? 'code' :
                   variant === 'list' ? 'ul' :
                   variant === 'table' ? 'div' :
                   variant

  const baseClasses = variants[variant] || variants.p
  const sizeClasses = size ? sizes[size] : ''
  
  return (
    <Component 
      className={cn(baseClasses, sizeClasses, className)} 
      {...props}
    >
      {children}
    </Component>
  )
}

// Pre-defined component variants for easy import
export const H1 = ({ className, ...props }) => (
  <Typography variant="h1" className={className} {...props} />
)

export const H2 = ({ className, ...props }) => (
  <Typography variant="h2" className={className} {...props} />
)

export const H3 = ({ className, ...props }) => (
  <Typography variant="h3" className={className} {...props} />
)

export const H4 = ({ className, ...props }) => (
  <Typography variant="h4" className={className} {...props} />
)

export const P = ({ className, ...props }) => (
  <Typography variant="p" className={className} {...props} />
)

export const Lead = ({ className, ...props }) => (
  <Typography variant="lead" className={className} {...props} />
)

export const Large = ({ className, ...props }) => (
  <Typography variant="large" className={className} {...props} />
)

export const Small = ({ className, ...props }) => (
  <Typography variant="small" className={className} {...props} />
)

export const Muted = ({ className, ...props }) => (
  <Typography variant="muted" className={className} {...props} />
)

export const InlineCode = ({ className, ...props }) => (
  <Typography variant="code" className={className} {...props} />
)

export const Blockquote = ({ className, ...props }) => (
  <Typography variant="blockquote" className={className} {...props} />
)

export const List = ({ className, ...props }) => (
  <Typography variant="list" className={className} {...props} />
)