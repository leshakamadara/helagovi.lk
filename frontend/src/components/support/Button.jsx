
import { cn } from "shadcn-ui";

export function Button({ children, className, variant = "default", ...props }) {
	const variants = {
		default: "bg-primary text-white hover:bg-primary/90",
		outline: "border border-primary text-primary bg-transparent hover:bg-primary/10",
		ghost: "bg-transparent hover:bg-primary/10 text-primary",
	};
	return (
		<button
			className={cn(
				"px-4 py-2 rounded font-medium transition-colors focus:outline-none",
				variants[variant],
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}
