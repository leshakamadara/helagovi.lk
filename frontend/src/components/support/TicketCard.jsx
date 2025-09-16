
import { Card, CardHeader, CardContent } from "./Card";
import { StatusBadge, PriorityBadge } from "./Badge";

export default function TicketCard({ ticket, onClick }) {
	return (
		<Card className="mb-4 cursor-pointer hover:shadow-lg" onClick={onClick}>
			<CardHeader>
				<div className="flex justify-between items-center">
					<span className="font-bold">{ticket.title}</span>
					<StatusBadge status={ticket.status} />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex gap-2 mb-2">
					<PriorityBadge priority={ticket.priority} />
					<span className="badge bg-gray-100 text-gray-800">{ticket.category}</span>
				</div>
				<div className="text-sm text-gray-600">Created by: {ticket.createdBy?.name || "Unknown"}</div>
				<div className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</div>
				{ticket.unreadMessages > 0 && (
					<span className="ml-2 text-xs text-red-500">{ticket.unreadMessages} unread</span>
				)}
			</CardContent>
		</Card>
	);
}
