import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, CreditCard, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from "../../lib/axios";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const { user } = useAuth();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 4000);
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id || '635'; // Use actual user ID or fallback for demo
      const res = await api.get(`/payments/transactions/${userId}`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showNotification("Error fetching payment history", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-gray-300 text-gray-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getPaymentMethod = (transaction) => {
    if (transaction.payment_method?.method) {
      return transaction.payment_method.method;
    }
    return 'PayHere';
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {notification && (
        <div className={`alert fixed top-4 right-4 z-50 max-w-md shadow-lg rounded-lg p-4 ${
          notification.type === 'error' ? 'bg-gray-100 border border-gray-300 text-gray-800' : 'bg-gray-50 border border-gray-200 text-gray-700'
        }`}>
          <CheckCircle className="w-5 h-5 mr-2 inline-block text-black" />
          <span>{notification.message}</span>
        </div>
      )}

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
              <BreadcrumbPage>Payment History</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <H1 className="text-gray-900">Payment History</H1>
        <P className="text-gray-600">View and track all your payment transactions</P>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="loading loading-spinner loading-lg text-black"></div>
        </div>
      )}

      {!isLoading && transactions.length === 0 && (
        <div className="text-center py-12">
          <H3 className="mb-2 text-gray-900">No payment history yet</H3>
          <P className="text-gray-500 mb-6">
            Your payment transactions will appear here once you make purchases
          </P>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      )}

      {!isLoading && transactions.length > 0 && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    transactions
                      .filter(t => t.status?.toLowerCase() === 'received' || t.status?.toLowerCase() === 'completed')
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transactions.filter(t => t.status?.toLowerCase() === 'received' || t.status?.toLowerCase() === 'completed').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction._id || transaction.paymentId}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        #{transaction.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {getPaymentMethod(transaction)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.customer ? (
                          <span className="text-sm">
                            {transaction.customer.fist_name} {transaction.customer.last_name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatAmount(transaction.amount, transaction.currency)}
                          </div>
                          {transaction.amount_detail?.fee && (
                            <div className="text-xs text-gray-500">
                              Fee: {formatAmount(transaction.amount_detail.fee, transaction.currency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}