import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Tractor,
  DollarSign,
  User,
  Calendar,
  MessageCircle
} from 'lucide-react';

const SupportDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    avgResolutionTime: '0 hours'
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: ''
  });
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API calls
    const mockTickets = [
      {
        _id: "1",
        title: "Rice price inquiry from bulk buyer",
        description: "Customer asking about wholesale rates for 500kg basmati rice",
        status: "Open",
        priority: "High",
        category: "Product",
        createdBy: { name: "Kamala Silva", email: "kamala@farmnet.lk" },
        assignedTo: { name: "Agent Perera" },
        createdAt: new Date().toISOString()
      },
      {
        _id: "2", 
        title: "Payment gateway timeout issue",
        description: "Payment failing during coconut oil purchase checkout",
        status: "In Progress",
        priority: "Medium", 
        category: "Payment",
        createdBy: { name: "Sunil Fernando", email: "sunil@buyers.lk" },
        assignedTo: { name: "Agent Silva" },
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: "3",
        title: "Account verification for new farmer",
        description: "Need help completing farmer profile verification",
        status: "Resolved",
        priority: "Low",
        category: "Account", 
        createdBy: { name: "Mahinda Rajapaksa", email: "mahinda@farmers.lk" },
        assignedTo: { name: "Agent Kumar" },
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    setTickets(mockTickets);
    setStats({
      totalTickets: mockTickets.length,
      openTickets: mockTickets.filter(t => t.status === "Open").length,
      resolvedToday: 1,
      avgResolutionTime: "2.5 hours"
    });
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'; 
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Progress': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Escalated': return 'bg-red-100 text-red-800 border-red-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Product': return <Wheat className="h-4 w-4" />;
      case 'Payment': return <DollarSign className="h-4 w-4" />;
      case 'Account': return <User className="h-4 w-4" />;
      case 'Technical': return <Tractor className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    return (filters.status === 'all' || ticket.status === filters.status) &&
           (filters.priority === 'all' || ticket.priority === filters.priority) &&
           (!filters.category || ticket.category === filters.category);
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    // Handle ticket creation
    setIsCreateTicketOpen(false);
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    // Fetch messages for this ticket
    setMessages([
      {
        _id: "m1",
        senderId: ticket.createdBy,
        message: ticket.description,
        createdAt: ticket.createdAt
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Wheat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HelaGoviSupport Dashboard</h1>
              <p className="text-gray-600">Managing farmer-buyer marketplace support</p>
            </div>
          </div>
          
          <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Create a new support ticket for the agricultural marketplace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Ticket Title</Label>
                  <Input id="title" placeholder="Brief description of the issue" required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Product">Product Inquiry</SelectItem>
                      <SelectItem value="Payment">Payment Issue</SelectItem>
                      <SelectItem value="Account">Account Support</SelectItem>
                      <SelectItem value="Technical">Technical Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Medium">Medium Priority</SelectItem>
                      <SelectItem value="Low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Detailed description of the issue..."
                    className="min-h-[100px]"
                    required 
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateTicketOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={() => {
                    // Handle ticket creation here
                    setIsCreateTicketOpen(false);
                  }}>
                    Create Ticket
                  </Button>
                </div>
                </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">All time tickets</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">Great progress!</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime}</div>
              <p className="text-xs text-muted-foreground">Response time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Support Tickets</CardTitle>
                  <div className="flex space-x-2">
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({...prev, priority: value}))}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div 
                      key={ticket._id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(ticket.category)}
                          <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>👤 {ticket.createdBy.name}</span>
                          <span>📧 {ticket.createdBy.email}</span>
                          {ticket.assignedTo && <span>🎯 Assigned to {ticket.assignedTo.name}</span>}
                        </div>
                        <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Detail / Chat */}
          <div>
            {selectedTicket ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getCategoryIcon(selectedTicket.category)}
                    <span>Ticket Details</span>
                  </CardTitle>
                  <CardDescription>{selectedTicket.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Priority:</span>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Category:</span>
                      <span>{selectedTicket.category}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Messages</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {messages.map((message) => (
                          <div key={message._id} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{message.senderId.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p>{message.message}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <Textarea 
                          placeholder="Type your response..."
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-between">
                          <Select>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Escalated">Escalated</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click on a ticket to view details and messages</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;