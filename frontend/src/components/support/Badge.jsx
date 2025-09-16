
import { cn } from "shadcn-ui";

const statusColors = {
	Open: "bg-blue-100 text-blue-800",
	"In Progress": "bg-yellow-100 text-yellow-800",
	Escalated: "bg-red-100 text-red-800",
	Resolved: "bg-green-100 text-green-800",
	Closed: "bg-gray-100 text-gray-800",
};

const priorityColors = {
	Low: "bg-green-100 text-green-800",
	Medium: "bg-yellow-100 text-yellow-800",
	High: "bg-red-100 text-red-800",
};

export function StatusBadge({ status, className }) {
	return (
		<span className={cn("px-2 py-1 rounded text-xs font-semibold", statusColors[status], className)}>
			{status}
		</span>
	);
}

export function PriorityBadge({ priority, className }) {
	return (
		<span className={cn("px-2 py-1 rounded text-xs font-semibold", priorityColors[priority], className)}>
			{priority}
		</span>
	);
}
