import { useEffect, useState } from "react";
import { Card, Badge } from "shadcn-ui";
import { useParams } from "react-router-dom";
import { getTicketById } from "../../lib/api";
import Chat from "../../components/Chat";

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTicket() {
      try {
        const { data } = await getTicketById(id);
        setTicket(data);
      } catch {
        setError("Ticket not found");
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!ticket) return null;

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <Card.Header>{ticket.title}</Card.Header>
      <div className="flex gap-2 mb-2">
        <Badge variant="info">{ticket.status}</Badge>
        <Badge variant="warning">{ticket.priority}</Badge>
        <Badge variant="secondary">{ticket.category}</Badge>
      </div>
      <div>{ticket.description}</div>
      <Chat ticketId={id} />
    </Card>
  );
}
