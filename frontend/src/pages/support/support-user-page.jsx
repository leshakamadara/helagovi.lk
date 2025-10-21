import React, { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
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
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wheat,
  DollarSign,
  User,
  Calendar,
  MessageCircle,
  Send,
  Search,
  Filter,
  Settings,
  Loader2,
} from 'lucide-react';
import api from '@/lib/axios';
import socketService from '@/lib/socket';

const UserSupportPage = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authToken) {
      fetchUserTickets();
      fetchUserStats();
      fetchCurrentUser();
    } else {
      setLoading(false);
      setStatsLoading(false);
      setError('Please log in to access support tickets');
    }
  }, [authToken]);

  // Socket connection and real-time messaging
  useEffect(() => {
    if (authToken && currentUser) {
      // Connect to socket server
      socketService.connect(authToken);

      // Join user room for personal messages
      socketService.joinUserRoom(currentUser.id);

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
        }

        // Update ticket message count in the tickets list
        setUserTickets((prev) =>
          prev.map((ticket) =>
            ticket._id === messageData.ticketId
              ? { ...ticket, messages: [...(ticket.messages || []), messageData] }
              : ticket,
          ),
        );
      };

      socketService.onReceiveMessage(handleReceiveMessage);

      return () => {
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    }
  }, [authToken, currentUser]);

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

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const userData = response.data.data.user;
      setCurrentUser({
        id: userData._id,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        role: userData.role,
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Fallback to JWT decoding if profile fetch fails
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        setCurrentUser({
          id: payload.id,
          name: payload.name || 'User',
          email: payload.email || '',
          role: payload.role || 'user',
        });
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        setCurrentUser({
          id: 'unknown',
          name: 'User',
          email: '',
          role: 'user',
        });
      }
    }
  };

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tickets/user', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUserTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get('/tickets/user/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
      };
    } finally {
      setStatsLoading(false);
    }
  };

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

  const filteredTickets = userTickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const [userStats, setUserStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const stats = await fetchUserStats();
      setUserStats({
        total: stats.total || 0,
        open: stats.open || 0,
        inProgress: stats.byStatus?.['In Progress'] || 0,
        resolved: stats.byStatus?.Resolved || 0,
      });
    };
    if (authToken) {
      loadStats();
    }
  }, [authToken, userTickets]);

  const handleCreateTicket = async () => {
    if (!ticketForm.title || !ticketForm.description || !ticketForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreatingTicket(true);
      setError(null);

      const response = await api.post('/tickets', ticketForm, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Add the new ticket to the list
      setUserTickets((prev) => [response.data.ticket, ...prev]);

      // Update stats
      const updatedStats = await fetchUserStats();
      setUserStats({
        total: updatedStats.total || 0,
        open: updatedStats.open || 0,
        inProgress: updatedStats.byStatus?.['In Progress'] || 0,
        resolved: updatedStats.byStatus?.Resolved || 0,
      });

      setTicketForm({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendMessage = async (ticketId) => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      setError(null);

      const response = await api.post(
        `/tickets/${ticketId}/messages`,
        {
          message: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      // Send via socket for real-time updates
      socketService.sendMessage(
        response.data.message.senderId._id,
        response.data.message.receiverId?._id,
        ticketId,
        newMessage
      );

      setNewMessage('');

      // Refresh messages for the selected ticket
      if (selectedTicket && selectedTicket._id === ticketId) {
        await fetchTicketMessages(ticketId);
      }

      // Refresh tickets to update last activity
      await fetchUserTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const fetchTicketMessages = async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleTicketClick = async (ticket) => {
    setSelectedTicket(ticket);
    await fetchTicketMessages(ticket._id);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/buyer-dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Support</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Support Center</h1>
          <p className="text-gray-600 mt-2">Get help and support for your account</p>
        </div>

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
                        {statsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          userStats.total
                        )}
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
                      <p className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-gray-900">
                        {statsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          userStats.open
                        )}
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
                        {statsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          userStats.inProgress
                        )}
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
                        {statsLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          userStats.resolved
                        )}
                      </p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New Ticket Button */}
            <div className="flex justify-end my-2">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch">
              {/* Tickets List */}
              <div className="lg:col-span-1 flex flex-col">
                <Card className="h-full flex flex-col border-0 shadow-sm">
                  <CardHeader className="pb-4 flex-shrink-0 bg-white">
                    <div className="mb-4">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        Your Tickets
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">
                        Track and manage your support requests
                      </CardDescription>
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
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Loading tickets...
                          </p>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-red-900 mb-2">
                          Error Loading Tickets
                        </h3>
                        <p className="text-sm text-red-700 max-w-sm mx-auto mb-4">
                          {error}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchUserTickets}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : !authToken ? (
                      <div className="text-center py-12 px-6">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Authentication Required
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Please log in to view your support tickets.
                        </p>
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
                            key={ticket._id || index}
                            className={`mb-4 cursor-pointer rounded-lg border-l-2 bg-white p-4 transition-all duration-150 border shadow-sm ${
                              selectedTicket &&
                              selectedTicket._id === ticket._id
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
                                        {currentUser?.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')
                                          .slice(0, 2) || 'U'}
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
                                    <span>0</span>
                                  </span>
                                </div>
                              </div>

                              {/* Footer Row */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1.5 text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="font-medium">
                                      {currentUser?.name || 'You'}
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
                                  {currentUser?.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2) || 'U'}
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
                                  {currentUser?.name || 'You'}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {currentUser?.email || ''}
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
                                    const isUser =
                                      message.senderId._id === currentUser?.id;
                                    return (
                                      <div
                                        key={message._id}
                                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[80%] ${
                                            isUser
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-background border'
                                          } rounded-lg p-3 shadow-sm`}
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium opacity-90">
                                              {isUser
                                                ? 'You'
                                                : message.senderId.name}
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
                                          Response will be visible to support
                                          team
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
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
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sending...
                                          </>
                                        ) : (
                                          <>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Message
                                          </>
                                        )}
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
                                Thank you for using our support!
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
                          Choose a ticket from the list to view details and
                          continue the conversation with our support team.
                        </p>
                        <div className="grid grid-cols-1 gap-4 text-left">
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                View & Track
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Monitor your ticket progress and status updates
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                Continue Conversation
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Send messages and receive responses from support
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                Get Help
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Receive assistance and resolution for your
                                issues
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

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Support Ticket
                  </DialogTitle>
                  <DialogDescription>
                    Submit a new support request. Our team will respond to you
                    as soon as possible.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Brief description of your issue"
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
                      placeholder="Please provide detailed information about your issue or question"
                      value={ticketForm.description}
                      onChange={(e) =>
                        setTicketForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="min-h-[120px] w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include any relevant details, error messages, or steps to
                      reproduce the issue.
                    </p>
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
                        creatingTicket
                      }
                      className="bg-primary hover:bg-primary/90"
                    >
                      {creatingTicket ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UserSupportPage;
