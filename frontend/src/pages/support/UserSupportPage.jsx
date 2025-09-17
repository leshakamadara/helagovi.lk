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
  Plus, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Wheat,
  Tractor,
  DollarSign,
  User,
  Calendar,
  MessageCircle,
  Send,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';

const UserSupportPage = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium'
  });

  // Mock user data - replace with actual user context
  const currentUser = {
    id: 'user123',
    name: 'Kamala Silva',
    email: 'kamala@helagovi.lk',
    role: 'farmer'
  };

  // Mock tickets data
  useEffect(() => {
    const mockUserTickets = [
      {
        _id: "t1",
        title: "Help with coconut pricing",
        description: "Need assistance setting competitive prices for coconut products",
        status: "Open",
        priority: "Medium",
        category: "Product",
        createdAt: new Date().toISOString(),
        messages: [
          {
            _id: "m1",
            senderId: { _id: currentUser.id, name: currentUser.name },
            message: "Need assistance setting competitive prices for coconut products",
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        _id: "t2",
        title: "Payment not received",
        description: "Payment for rice order #12345 not received yet",
        status: "In Progress",
        priority: "High", 
        category: "Payment",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        assignedTo: { name: "Support Agent" },
        messages: [
          {
            _id: "m2",
            senderId: { _id: currentUser.id, name: currentUser.name },
            message: "Payment for rice order #12345 not received yet",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: "m3", 
            senderId: { _id: "agent1", name: "Support Agent" },
            message: "I'm looking into this issue. Can you provide the transaction ID?",
            createdAt: new Date(Date.now() - 43200000).toISOString()
          }
        ]
      }
    ];
    setUserTickets(mockUserTickets);
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

  const handleSubmitTicket = () => {
    if (!ticketForm.title || !ticketForm.description || !ticketForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    const newTicket = {
      _id: `t${Date.now()}`,
      title: ticketForm.title,
      description: ticketForm.description,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: 'Open',
      createdAt: new Date().toISOString(),
      messages: [{
        _id: `m${Date.now()}`,
        senderId: { _id: currentUser.id, name: currentUser.name },
        message: ticketForm.description,
        createdAt: new Date().toISOString()
      }]
    };

    setUserTickets(prev => [newTicket, ...prev]);
    setTicketForm({ title: '', description: '', category: '', priority: 'Medium' });
    setIsSubmitOpen(false);
  };

  const handleSendMessage = (ticketId) => {
    if (!newMessage.trim()) return;

    const message = {
      _id: `m${Date.now()}`,
      senderId: { _id: currentUser.id, name: currentUser.name },
      message: newMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update ticket messages
    setUserTickets(prev => prev.map(ticket => 
      ticket._id === ticketId 
        ? { ...ticket, messages: [...ticket.messages, message] }
        : ticket
    ));
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setMessages(ticket.messages || []);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Open': return <Clock className="h-4 w-4" />;
      case 'In Progress': return <AlertTriangle className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      case 'Closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-green-600 rounded-full">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">HelaGovi.lk Support</h1>
              <p className="text-lg text-gray-600">Get help with your agricultural marketplace needs</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Submit New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Wheat className="h-5 w-5 text-green-600" />
                    <span>Submit Support Request</span>
                  </DialogTitle>
                  <DialogDescription>
                    Tell us how we can help you with the agricultural marketplace.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">What do you need help with? *</Label>
                    <Input 
                      id="title" 
                      placeholder="Brief description of your issue or question"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm(prev => ({...prev, title: e.target.value}))}
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({...prev, category: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Product">🌾 Product Questions</SelectItem>
                          <SelectItem value="Payment">💰 Payment Issues</SelectItem>
                          <SelectItem value="Account">👤 Account Help</SelectItem>
                          <SelectItem value="Technical">🔧 Technical Problems</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">How urgent is this?</Label>
                      <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({...prev, priority: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">🔴 High - Urgent</SelectItem>
                          <SelectItem value="Medium">🟡 Medium - Normal</SelectItem>
                          <SelectItem value="Low">🟢 Low - When possible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Please describe your issue in detail *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Provide as much detail as possible to help us assist you better..."
                      className="min-h-[120px]"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm(prev => ({...prev, description: e.target.value}))}
                      required 
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Tips for faster resolution:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Include order numbers, product names, or account details</li>
                      <li>• Mention what you were trying to do when the issue occurred</li>
                      <li>• Describe any error messages you saw</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitTicket} className="bg-green-600 hover:bg-green-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-600" />
                <span>Emergency Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Need immediate help?</p>
              <p className="font-semibold text-green-600">📞 +94 11 234 5678</p>
              <p className="text-sm text-gray-500">Available 8 AM - 8 PM</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Email Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Send us an email</p>
              <p className="font-semibold text-blue-600">support@Helagovi.lk</p>
              <p className="text-sm text-gray-500">Response within 24 hours</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <span>FAQ & Guides</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Find quick answers</p>
              <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
                Browse FAQ
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User's Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Support Tickets</span>
                  <Badge variant="secondary">{userTickets.length} total</Badge>
                </CardTitle>
                <CardDescription>
                  Track your support requests and get updates on their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No support tickets yet</p>
                    <p>Click "Submit New Ticket" to get help with any issues</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userTickets.map((ticket) => (
                      <div 
                        key={ticket._id}
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-green-300"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(ticket.category)}
                            <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                          </div>
                          <div className="flex space-x-2">
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(ticket.status)}
                                <span>{ticket.status}</span>
                              </span>
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </span>
                            {ticket.assignedTo && (
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>Assigned to {ticket.assignedTo.name}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{ticket.messages?.length || 0} messages</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ticket Conversation */}
          <div>
            {selectedTicket ? (
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getCategoryIcon(selectedTicket.category)}
                    <span className="truncate">{selectedTicket.title}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>Conversation</span>
                      </h4>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {messages.map((message) => {
                          const isUser = message.senderId._id === currentUser.id;
                          return (
                            <div key={message._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-lg ${
                                isUser 
                                  ? 'bg-green-100 text-green-800 rounded-br-sm' 
                                  : 'bg-blue-100 text-blue-800 rounded-bl-sm'
                              }`}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium text-xs">
                                    {isUser ? 'You' : message.senderId.name}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm">{message.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    {selectedTicket.status !== 'Closed' && (
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            onClick={() => handleSendMessage(selectedTicket._id)}
                            disabled={!newMessage.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedTicket.status === 'Closed' && (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="font-medium">This ticket has been resolved and closed</p>
                        <p className="text-sm">Thank you for using Helagovi.lk Support!</p>
                      </div>
                    )}
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
                    <p className="mb-2">Choose a ticket to view the conversation</p>
                    <p className="text-sm">Click on any ticket from the list to see messages and updates</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t pt-6">
          <p>© 2025 Helagovi.lk Agricultural Marketplace. We're here to help you succeed! 🌾</p>
        </div>
      </div>
    </div>
  );
};

export default UserSupportPage;