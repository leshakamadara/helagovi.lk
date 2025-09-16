import React, { useEffect, useState } from 'react';
import { getTicketById } from '../lib/api';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        setError('Ticket not found');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-error">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ticket Details</h1>
      <div className="card bg-base-100 shadow mb-4">
        <div className="card-body">
          <h2 className="card-title">{ticket.title}</h2>
          <div className="badge badge-info mr-2">{ticket.status}</div>
          <div className="badge badge-warning mr-2">{ticket.priority}</div>
          <div className="badge badge-secondary mr-2">{ticket.category}</div>
          <p className="mt-2">{ticket.description}</p>
        </div>
      </div>
      <Chat ticketId={id} />
    </div>
  );
};

export default TicketDetails;
