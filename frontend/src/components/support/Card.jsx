
import { cn } from "shadcn-ui";

export function Card({ children, className }) {
	return (
		<div className={cn("rounded-lg border bg-background shadow-sm", className)}>
			{children}
		</div>
	);
}

export function CardHeader({ children, className }) {
	return (
		<div className={cn("px-6 py-4 border-b font-semibold text-lg", className)}>
			{children}
		</div>
	);
}

export function CardContent({ children, className }) {
	return (
		<div className={cn("px-6 py-4", className)}>
			{children}
		</div>
	);
}
