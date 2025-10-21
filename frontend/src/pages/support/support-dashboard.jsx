import React, { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Wheat,
  DollarSign,
  User,
  Calendar,
  MessageCircle,
  Settings,
  TrendingUp,
  BarChart3,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import socketService from '@/lib/socket';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [privateNotes, setPrivateNotes] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    customerName: '',
    customerEmail: '',
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Auth token
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));

  // API functions
  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await api.get('/tickets', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTickets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
      toast.error('Failed to load tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      setMessagesLoading(true);
      const [ticketResponse, messagesResponse] = await Promise.all([
        api.get(`/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        api.get(`/tickets/${ticketId}/messages`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      setSelectedTicket(ticketResponse.data.ticket);
      setMessages(messagesResponse.data.messages);
      setError(null);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Failed to load ticket details');
      toast.error('Failed to load ticket details');
    } finally {
      setMessagesLoading(false);
    }
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      setUpdatingTicket(true);
      const response = await api.put(`/tickets/${ticketId}`, updates, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Update local state
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId ? response.data : ticket,
        ),
      );

      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(response.data);
      }

      toast.success('Ticket updated successfully');
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error('Failed to update ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const sendMessage = async (ticketId, message) => {
    try {
      setSendingMessage(true);
      const response = await api.post(
        `/tickets/${ticketId}/messages`,
        { message },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      // Send via socket for real-time updates
      socketService.sendMessage(
        response.data.message.senderId._id,
        response.data.message.receiverId?._id,
        ticketId,
        message
      );

      // Add message to local state
      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage('');

      toast.success('Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Mock data for support agents
  const supportAgents = [
    { id: 'agent1', name: 'Priya Fernando', email: 'priya@helagovi.lk' },
    { id: 'agent2', name: 'Nimal Perera', email: 'nimal@helagovi.lk' },
    { id: 'agent3', name: 'Kumari Silva', email: 'kumari@helagovi.lk' },
  ];

  useEffect(() => {
    if (authToken) {
      fetchTickets();
    } else {
      setLoading(false);
      setError('Authentication required');
    }
  }, [authToken]);

  // Socket connection and real-time messaging
  useEffect(() => {
    if (authToken) {
      // Connect to socket server
      socketService.connect(authToken);

      // Join agent room for admin/support users
      socketService.socket?.emit('joinRoom', { userRole: 'agent' });

      // Listen for incoming messages
      const handleReceiveMessage = (messageData) => {
        console.log('Received real-time message:', messageData);

        // Update messages if we're viewing the relevant ticket
        if (selectedTicket && selectedTicket._id === messageData.ticketId) {
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => msg._id === messageData._id);
            if (messageExists) return prev;

            return [...prev, messageData];
          });

          // Update ticket message count in the tickets list
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket._id === messageData.ticketId
                ? { ...ticket, messages: [...(ticket.messages || []), messageData] }
                : ticket,
            ),
          );
        } else {
          // Update ticket message count even if not viewing the ticket
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket._id === messageData.ticketId
                ? { ...ticket, messages: [...(ticket.messages || []), messageData] }
                : ticket,
            ),
          );
        }
      };

      socketService.onReceiveMessage(handleReceiveMessage);

      return () => {
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    }
  }, [authToken]);

  // Join/leave ticket rooms when selected ticket changes
  useEffect(() => {
    if (selectedTicket && socketService.isSocketConnected) {
      socketService.joinTicketRoom(selectedTicket._id);
    }

    return () => {
      if (selectedTicket && socketService.isSocketConnected) {
        socketService.leaveTicketRoom(selectedTicket._id);
      }
    };
  }, [selectedTicket]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'In Progress':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Resolved':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'Closed':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Product':
        return <Wheat className="h-4 w-4" />;
      case 'Payment':
        return <DollarSign className="h-4 w-4" />;
      case 'Account':
        return <User className="h-4 w-4" />;
      case 'Technical':
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <Clock className="h-4 w-4" />;
      case 'In Progress':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.createdBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.createdBy?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handlePriorityChange = async (ticketId, newPriority) => {
    await updateTicket(ticketId, { priority: newPriority });
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicket(ticketId, { status: newStatus });
  };

  const handleAssignTicket = (ticketId) => {
    if (!selectedAgent) return;

    const agent = supportAgents.find((a) => a.id === selectedAgent);
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, assignedTo: agent } : ticket,
      ),
    );
    setIsAssignOpen(false);
    setSelectedAgent('');
  };

  const handleCreateTicket = async () => {
    if (
      !ticketForm.title ||
      !ticketForm.description ||
      !ticketForm.category ||
      !ticketForm.customerName ||
      !ticketForm.customerEmail
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUpdatingTicket(true);
      const response = await api.post(
        '/tickets',
        {
          title: ticketForm.title,
          description: ticketForm.description,
          category: ticketForm.category,
          priority: ticketForm.priority,
          // Note: In a real implementation, you'd need to create/find the user first
          // For now, we'll create a ticket with mock user data
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      // Add the new ticket to the list
      setTickets((prev) => [response.data.ticket, ...prev]);

      setTicketForm({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        customerName: '',
        customerEmail: '',
      });
      setIsCreateOpen(false);
      toast.success('Ticket created successfully');
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Failed to create ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleAddPrivateNote = () => {
    if (!privateNotes.trim() || !selectedTicket) return;

    const note = {
      _id: `n${Date.now()}`,
      agentId: 'agent1',
      agentName: 'Support Agent',
      note: privateNotes,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket._id === selectedTicket._id
          ? { ...ticket, privateNotes: [...(ticket.privateNotes || []), note] }
          : ticket,
      ),
    );

    setSelectedTicket((prev) => ({
      ...prev,
      privateNotes: [...(prev.privateNotes || []), note],
    }));
    setPrivateNotes('');
    setIsNotesOpen(false);
  };

  const handleSendMessage = async (ticketId) => {
    if (!newMessage.trim()) return;
    await sendMessage(ticketId, newMessage);
  };

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
    await fetchTicketDetails(ticket._id);
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  return (
    <div>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 min-h-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="@container/card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Tickets
                      </p>
                      <p className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="@container/card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Open Tickets
                      </p>
                      <p className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums ext-gray-900">
                        {stats.open}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="@container/card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        In Progress
                      </p>
                      <p className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-gray-900">
                        {stats.inProgress}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="@container/card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Resolved
                      </p>
                      <p className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-gray-900">
                        {stats.resolved}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
              {/* Tickets List */}
              <div className="lg:col-span-1 flex flex-col">
                <Card className="h-full flex flex-col border-0 shadow-sm">
                  <CardHeader className="pb-4 flex-shrink-0 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          All Tickets
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          Manage customer support requests
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Ticket
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tickets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-9 border-border"
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[130px] h-9">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-0">
                    {ticketsLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            Loading tickets...
                          </p>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                          <p className="text-sm text-destructive mb-4">
                            {error}
                          </p>
                          <Button
                            onClick={fetchTickets}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      </div>
                    ) : filteredTickets.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No tickets found
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No support tickets have been created yet. Create your first ticket to get started.'}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-6">
                        {filteredTickets.map((ticket, index) => (
                          <div
                            key={ticket._id}
                            className={`p-5 hover:bg-muted/30 transition-all duration-200 cursor-pointer relative border-l-2 ${
                              index > 0 ? 'border-t border-border' : ''
                            } ${
                              selectedTicket?._id === ticket._id
                                ? 'bg-primary/5 border-l-primary shadow-sm'
                                : 'border-l-transparent hover:border-l-border'
                            }`}
                            onClick={() => handleTicketClick(ticket)}
                          >
                            <div className="space-y-4">
                              {/* Header Row */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                      <span className="text-sm font-semibold text-primary">
                                        {ticket.createdBy?.firstName && ticket.createdBy?.lastName
                                          ? `${ticket.createdBy.firstName[0]}${ticket.createdBy.lastName[0]}`
                                          : 'U'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="font-semibold text-foreground text-sm leading-5">
                                        {ticket.title}
                                      </h3>
                                      <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                                        TKT - {ticket.ticketNumber?.toString().padStart(3, '0') || '001'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                      {ticket.description}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Status and Priority Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {/* Status with Dot */}
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`w-2.5 h-2.5 rounded-full ${
                                        ticket.status === 'Open'
                                          ? 'bg-blue-500'
                                          : ticket.status === 'In Progress'
                                            ? 'bg-yellow-500'
                                            : ticket.status === 'Resolved'
                                              ? 'bg-green-500'
                                              : 'bg-gray-400'
                                      }`}
                                    ></div>
                                    <span className="text-xs font-medium text-foreground">
                                      {ticket.status}
                                    </span>
                                  </div>

                                  {/* Priority with Badge */}
                                  <Badge
                                    variant={
                                      ticket.priority === 'High'
                                        ? 'destructive'
                                        : ticket.priority === 'Medium'
                                          ? 'default'
                                          : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {ticket.priority}
                                  </Badge>
                                </div>

                                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                  <span className="flex items-center space-x-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{ticket.messages?.length || 0}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Footer Row */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1.5 text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {ticket.createdBy?.firstName}{' '}
                                      {ticket.createdBy?.lastName}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                      {new Date(
                                        ticket.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {ticket.assignedTo && (
                                  <div className="flex items-center space-x-1.5">
                                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                      <User className="h-2.5 w-2.5 text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-foreground">
                                      {ticket.assignedTo.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Ticket Detail */}
              <div className="lg:col-span-2 flex flex-col">
                {selectedTicket ? (
                  <div className="space-y-6 h-full flex flex-col">
                    {/* Main Ticket Card */}
                    <Card className="flex-1 flex flex-col border-0 shadow-sm">
                      <CardHeader className="pb-4 flex-shrink-0 border-b bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                <span className="text-base font-semibold text-primary">
                                  {selectedTicket.createdBy?.firstName && selectedTicket.createdBy?.lastName
                                    ? `${selectedTicket.createdBy.firstName[0]}${selectedTicket.createdBy.lastName[0]}`
                                    : 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <CardTitle className="text-xl font-semibold text-foreground leading-6">
                                  {selectedTicket.title}
                                </CardTitle>
                                <span className="text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded">
                                  TKT - {selectedTicket.ticketNumber?.toString().padStart(3, '0') || '001'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 mt-2">
                                {/* Status with Dot */}
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      selectedTicket.status === 'Open'
                                        ? 'bg-blue-500'
                                        : selectedTicket.status ===
                                            'In Progress'
                                          ? 'bg-yellow-500'
                                          : selectedTicket.status === 'Resolved'
                                            ? 'bg-green-500'
                                            : 'bg-gray-400'
                                    }`}
                                  ></div>
                                  <span className="text-sm font-medium text-foreground">
                                    {selectedTicket.status}
                                  </span>
                                </div>

                                {/* Priority with Badge */}
                                <Badge
                                  variant={
                                    selectedTicket.priority === 'High'
                                      ? 'destructive'
                                      : selectedTicket.priority === 'Medium'
                                        ? 'default'
                                        : 'secondary'
                                  }
                                  className="text-sm"
                                >
                                  {selectedTicket.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsNotesOpen(true)}
                              className="h-8"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Notes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsAssignOpen(true)}
                              className="h-8"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Assign
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center text-muted-foreground">
                                <User className="h-4 w-4 mr-2" />
                                <span className="font-medium">Customer</span>
                              </div>
                              <div className="ml-6">
                                <p className="font-medium text-foreground">
                                  {selectedTicket.createdBy?.firstName} {selectedTicket.createdBy?.lastName}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {selectedTicket.createdBy?.email}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="font-medium">Created</span>
                              </div>
                              <div className="ml-6">
                                <p className="text-foreground">
                                  {new Date(
                                    selectedTicket.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                                {selectedTicket.assignedTo && (
                                  <p className="text-muted-foreground text-xs">
                                    Assigned to {selectedTicket.assignedTo.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-muted-foreground">
                                <span className="font-medium">Category</span>
                              </div>
                              <div className="ml-6 flex items-center gap-2">
                                {getCategoryIcon(selectedTicket.category)}
                                <span className="text-foreground">
                                  {selectedTicket.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Select
                              value={selectedTicket.priority}
                              onValueChange={(value) =>
                                handlePriorityChange(selectedTicket._id, value)
                              }
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">
                                  Low Priority
                                </SelectItem>
                                <SelectItem value="Medium">
                                  Medium Priority
                                </SelectItem>
                                <SelectItem value="High">
                                  High Priority
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={selectedTicket.status}
                              onValueChange={(value) =>
                                handleStatusChange(selectedTicket._id, value)
                              }
                            >
                              <SelectTrigger className="w-40 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Resolved">
                                  Resolved
                                </SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col p-0">
                        <div className="space-y-6 flex-1 flex flex-col p-6">
                          {/* Messages */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-foreground flex items-center">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Conversation
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {messages.length}{' '}
                                {messages.length === 1 ? 'message' : 'messages'}
                              </span>
                            </div>
                            <div className="flex-1 overflow-y-auto border rounded-lg bg-muted/30">
                              {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                  <div className="text-center">
                                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                      No messages yet
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 space-y-4">
                                  {messages.map((message, index) => {
                                    const isAgent =
                                      message.senderId?.role === 'admin';
                                    return (
                                      <div
                                        key={message._id}
                                        className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[80%] ${
                                            isAgent
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-background border'
                                          } rounded-lg p-3 shadow-sm`}
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium opacity-90">
                                              {isAgent
                                                ? 'Support Agent'
                                                : `${message.senderId?.firstName} ${message.senderId?.lastName}`}
                                            </span>
                                            <span className="text-xs opacity-70">
                                              {new Date(
                                                message.createdAt,
                                              ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-sm leading-relaxed">
                                            {message.message}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Message Input */}
                          {selectedTicket.status !== 'Closed' &&
                            selectedTicket.status !== 'Resolved' && (
                              <div className="space-y-3 flex-shrink-0">
                                <div className="border rounded-lg shadow-sm">
                                  <Textarea
                                    placeholder="Type your response to the customer..."
                                    value={newMessage}
                                    onChange={(e) =>
                                      setNewMessage(e.target.value)
                                    }
                                    className="min-h-[100px] border-0 resize-none focus-visible:ring-0 bg-background"
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === 'Enter' &&
                                        (e.metaKey || e.ctrlKey)
                                      ) {
                                        e.preventDefault();
                                        handleSendMessage(selectedTicket._id);
                                      }
                                    }}
                                  />
                                  <div className="flex justify-between items-center p-3 border-t bg-muted/50">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>
                                          Response will be visible to customer
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Press Enter to send
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsNotesOpen(true)}
                                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Add Note
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSendMessage(selectedTicket._id)
                                        }
                                        disabled={
                                          !newMessage.trim() || sendingMessage
                                        }
                                        className="bg-primary hover:bg-primary/90"
                                      >
                                        {sendingMessage ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                        )}
                                        {sendingMessage
                                          ? 'Sending...'
                                          : 'Send Response'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                          {(selectedTicket.status === 'Closed' ||
                            selectedTicket.status === 'Resolved') && (
                            <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200 flex-shrink-0">
                              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                              <h3 className="font-semibold text-green-900 text-lg mb-1">
                                Ticket {selectedTicket.status}
                              </h3>
                              <p className="text-sm text-green-700">
                                Customer has been notified of the resolution
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Private Notes Card */}
                    {selectedTicket.privateNotes &&
                      selectedTicket.privateNotes.length > 0 && (
                        <Card className="flex-shrink-0 border-0 shadow-sm">
                          <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center font-semibold">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Private Notes
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {selectedTicket.privateNotes.length}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Internal notes shared with your team (not visible
                              to customers)
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-3 max-h-40 overflow-y-auto">
                              {selectedTicket.privateNotes.map((note) => (
                                <div
                                  key={note._id}
                                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-sm text-amber-900">
                                      {note.agentName}
                                    </span>
                                    <span className="text-xs text-amber-600">
                                      {new Date(
                                        note.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-amber-800 leading-relaxed">
                                    {note.note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                ) : (
                  <Card className="h-full flex flex-col border-0 shadow-sm">
                    <CardHeader className="flex-shrink-0 border-b bg-white">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <MessageSquare className="h-5 w-5 mr-3" />
                        Ticket Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center">
                      <div className="text-center py-16 max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          Select a Ticket
                        </h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                          Choose a ticket from the list to view details, manage
                          status, and communicate with customers.
                        </p>
                        <div className="grid grid-cols-1 gap-4 text-left">
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                View & Track
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Monitor ticket progress and customer
                                interactions
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                Set Priority
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Assign High, Medium, or Low priority levels
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                Team Collaboration
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Share private notes and assign to team members
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Assign Ticket Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Assign Ticket
                  </DialogTitle>
                  <DialogDescription>
                    Assign this ticket to a support agent for follow-up and
                    resolution.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent" className="text-sm font-medium">
                      Select Agent
                    </Label>
                    <Select
                      value={selectedAgent}
                      onValueChange={setSelectedAgent}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {supportAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3" />
                              </div>
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {agent.email}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsAssignOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleAssignTicket(selectedTicket._id)}
                      disabled={!selectedAgent}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Support Ticket
                  </DialogTitle>
                  <DialogDescription>
                    Create a new support ticket for a customer inquiry or issue.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="customerName"
                        className="text-sm font-medium"
                      >
                        Customer Name{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer name"
                        value={ticketForm.customerName}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="customerEmail"
                        className="text-sm font-medium"
                      >
                        Customer Email{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        value={ticketForm.customerEmail}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            customerEmail: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Ticket Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={ticketForm.title}
                      onChange={(e) =>
                        setTicketForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={ticketForm.category}
                        onValueChange={(value) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Product">
                            <div className="flex items-center space-x-2">
                              <Wheat className="h-4 w-4" />
                              <span>Product</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Payment">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Payment</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Account">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Account</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Technical">
                            <div className="flex items-center space-x-2">
                              <Settings className="h-4 w-4" />
                              <span>Technical</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </Label>
                      <Select
                        value={ticketForm.priority}
                        onValueChange={(value) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            priority: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">
                            <Badge variant="secondary" className="text-xs">
                              Low Priority
                            </Badge>
                          </SelectItem>
                          <SelectItem value="Medium">
                            <Badge variant="default" className="text-xs">
                              Medium Priority
                            </Badge>
                          </SelectItem>
                          <SelectItem value="High">
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the customer's request or issue"
                      value={ticketForm.description}
                      onChange={(e) =>
                        setTicketForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[120px] w-full"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={
                        !ticketForm.title ||
                        !ticketForm.description ||
                        !ticketForm.category ||
                        !ticketForm.customerName ||
                        !ticketForm.customerEmail
                      }
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Private Notes Dialog */}
            <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Add Private Note
                  </DialogTitle>
                  <DialogDescription>
                    Add an internal note that will be shared with your team.
                    This is not visible to the customer.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="privateNote"
                      className="text-sm font-medium"
                    >
                      Note
                    </Label>
                    <Textarea
                      id="privateNote"
                      placeholder="Add your internal notes here..."
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                      className="min-h-[120px] w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      This note will only be visible to your support team
                      members.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsNotesOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPrivateNote}
                      disabled={!privateNotes.trim()}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
