import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  EyeOff,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Calendar
} from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { H1, H2, H3, P, Muted, Large } from '../../components/ui/typography'

const FarmerWallet = () => {
  const { user } = useAuth()
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    lastWithdrawal: null
  })
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchCode: ''
  })
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchWalletData()
    fetchWithdrawals()
  }, [])

  const fetchWalletData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/wallet', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      // Mock data for now
      const mockWalletData = {
        availableBalance: 45750,
        pendingBalance: 12300,
        totalEarnings: 125500,
        lastWithdrawal: {
          amount: 25000,
          date: '2024-01-15T00:00:00.000Z',
          status: 'completed'
        }
      }
      
      setWalletData(mockWalletData)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/wallet/withdrawals', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      
      // Mock data for now
      const mockWithdrawals = [
        {
          _id: '1',
          amount: 25000,
          status: 'completed',
          method: 'bank_transfer',
          bankDetails: {
            bankName: 'Commercial Bank',
            accountNumber: '****1234'
          },
          requestedAt: '2024-01-15T10:00:00.000Z',
          processedAt: '2024-01-16T14:30:00.000Z',
          transactionId: 'TXN123456789'
        },
        {
          _id: '2',
          amount: 15500,
          status: 'pending',
          method: 'bank_transfer',
          bankDetails: {
            bankName: 'People\'s Bank',
            accountNumber: '****5678'
          },
          requestedAt: '2024-01-20T09:15:00.000Z',
          estimatedCompletion: '2024-01-22T00:00:00.000Z'
        },
        {
          _id: '3',
          amount: 8750,
          status: 'failed',
          method: 'bank_transfer',
          bankDetails: {
            bankName: 'Bank of Ceylon',
            accountNumber: '****9012'
          },
          requestedAt: '2024-01-10T16:45:00.000Z',
          failureReason: 'Invalid account details'
        }
      ]
      
      setWithdrawals(mockWithdrawals)
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (parseFloat(withdrawAmount) > walletData.availableBalance) {
      alert('Insufficient balance')
      return
    }

    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountHolderName) {
      alert('Please provide complete bank details')
      return
    }

    try {
      setWithdrawing(true)
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/wallet/withdraw', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     amount: parseFloat(withdrawAmount),
      //     bankDetails
      //   })
      // })
      
      // Mock successful withdrawal request
      const newWithdrawal = {
        _id: Date.now().toString(),
        amount: parseFloat(withdrawAmount),
        status: 'pending',
        method: 'bank_transfer',
        bankDetails: {
          bankName: bankDetails.bankName,
          accountNumber: `****${bankDetails.accountNumber.slice(-4)}`
        },
        requestedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      }

      setWithdrawals(prev => [newWithdrawal, ...prev])
      setWalletData(prev => ({
        ...prev,
        availableBalance: prev.availableBalance - parseFloat(withdrawAmount),
        pendingBalance: prev.pendingBalance + parseFloat(withdrawAmount)
      }))

      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setBankDetails({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        branchCode: ''
      })
      
      alert('Withdrawal request submitted successfully!')
    } catch (error) {
      alert('Failed to submit withdrawal request')
    } finally {
      setWithdrawing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/farmer-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Wallet & Earnings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <H1 className="text-gray-900">Wallet & Earnings</H1>
        <P className="text-gray-600">Manage your earnings and withdrawal requests</P>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Balance</p>
              <div className="flex items-center mt-2">
                {showBalance ? (
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(walletData.availableBalance)}
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-gray-400">••••••</p>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                >
                  {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={walletData.availableBalance <= 0}
            className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Withdraw Funds
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Balance</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {formatCurrency(walletData.pendingBalance)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Funds being processed for withdrawal
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(walletData.totalEarnings)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Lifetime earnings from sales
          </p>
        </div>
      </div>

      {/* Last Withdrawal Info */}
      {walletData.lastWithdrawal && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800">
              Last withdrawal: <strong>{formatCurrency(walletData.lastWithdrawal.amount)}</strong> on{' '}
              {formatDate(walletData.lastWithdrawal.date)}
            </p>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Withdrawal History</h3>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-gray-600">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Banknote className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{withdrawal.bankDetails.bankName}</span>
                        <span>•</span>
                        <span>{withdrawal.bankDetails.accountNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {getStatusBadge(withdrawal.status)}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(withdrawal.requestedAt)}
                    </p>
                    {withdrawal.status === 'pending' && withdrawal.estimatedCompletion && (
                      <p className="text-xs text-blue-600 mt-1">
                        Est. completion: {formatDate(withdrawal.estimatedCompletion)}
                      </p>
                    )}
                    {withdrawal.status === 'failed' && withdrawal.failureReason && (
                      <p className="text-xs text-red-600 mt-1">
                        {withdrawal.failureReason}
                      </p>
                    )}
                    {withdrawal.transactionId && (
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {withdrawal.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <Download className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawals yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your withdrawal requests will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Request Withdrawal
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Amount (LKR)
                        </label>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          max={walletData.availableBalance}
                          min="100"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter amount"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {formatCurrency(walletData.availableBalance)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Bank Name
                        </label>
                        <select
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select Bank</option>
                          <option value="Commercial Bank">Commercial Bank</option>
                          <option value="People's Bank">People's Bank</option>
                          <option value="Bank of Ceylon">Bank of Ceylon</option>
                          <option value="Hatton National Bank">Hatton National Bank</option>
                          <option value="Sampath Bank">Sampath Bank</option>
                          <option value="Seylan Bank">Seylan Bank</option>
                          <option value="Nations Trust Bank">Nations Trust Bank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountHolderName}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Full name as per bank account"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Bank account number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Branch Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={bankDetails.branchCode}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, branchCode: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Branch code"
                        />
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-yellow-800">
                              <strong>Processing Time:</strong> 1-3 business days
                            </p>
                            <p className="text-yellow-700 mt-1">
                              Minimum withdrawal amount is LKR 100. Processing fees may apply.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleWithdrawRequest}
                  disabled={withdrawing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
                >
                  {withdrawing ? 'Processing...' : 'Submit Request'}
                </button>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerWallet