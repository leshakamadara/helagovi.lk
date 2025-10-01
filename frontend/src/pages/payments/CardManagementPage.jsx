import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, CreditCard, Wifi } from 'lucide-react';
import api from "../../lib/axios";
import EditCardForm from '../../components/EditCardModal.jsx';

export default function CardManagerPage() {
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [formData, setFormData] = useState({ card_name: '', expiry_month: '', expiry_year: '' });

  const SESSION_USER_ID = "635";
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' }, { value: '03', label: 'March' },
    { value: '04', label: 'April' }, { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' }, { value: '09', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 4000);
  };

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payments/card/${SESSION_USER_ID}`);
      const data = res.data;
      setCards(Array.isArray(data) ? data : [data]);
    } catch (err) {
      if (err.response?.status === 404) setCards([]);
      else showNotification("Error fetching cards from backend", "error");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const handlePreapproval = async () => {
    setIsLoading(true);
    try { window.location.href = `/saveCard/?userId=${SESSION_USER_ID}`; } 
    finally { setIsLoading(false); }
  };

  const updateCard = async (cardId, cardData) => {
    setIsLoading(true);
    try {
      const res = await api.put(`/payments/card/${cardId}`, cardData);
      setCards(cards.map(c => c._id === cardId ? { ...c, ...res.data } : c));
      showNotification("Card updated successfully");
      window.location.reload();
    } catch (err) { showNotification("Error updating card", "error"); throw err; }
    finally { setIsLoading(false); }
  };

  const deleteCard = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    setIsLoading(true);
    try {
      await api.delete(`/payments/card/${cardId}`);
      setCards(cards.filter(c => c._id !== cardId));
      showNotification("Card deleted successfully");
    } catch (err) { showNotification("Error deleting card", "error"); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.card_name || !formData.expiry_month || !formData.expiry_year) {
      showNotification("Please fill all fields", 'error');
      return;
    }
    if (editingCard) {
      try { await updateCard(editingCard._id, formData); handleCloseModal(); } 
      catch (err) {}
    }
  };

  const handleOpenModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setFormData({ card_name: card.card_name || '', expiry_month: card.expiry_month || '', expiry_year: card.expiry_year || '' });
    } else { handlePreapproval(); return; }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
    setFormData({ card_name: '', expiry_month: '', expiry_year: '' });
  };

  const handleInputChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value })); 
  };

  const getCardGradient = (method) => {
    const cardMethod = method?.toUpperCase();
    switch (cardMethod) {
      case 'VISA': return 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900';
      case 'MASTER': return 'bg-gradient-to-br from-red-600 via-red-700 to-red-900';
      default: return 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900';
    }
  };

  const formatCardNumber = (cardNo) => cardNo?.replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••';
  const formatCardName = (name) => name?.toUpperCase() || 'CARD HOLDER';
  const formatExpiry = (month, year) => month && year ? `${month}/${year.toString().slice(-2)}` : 'MM/YY';

  return (
    <div className="min-h-screen bg-green-50 p-6 relative overflow-hidden">
      {notification && (
        <div className={`alert fixed top-4 right-4 z-50 max-w-md shadow-lg rounded-lg p-4 ${
          notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-800'
        }`}>
          <Check className="w-5 h-5 mr-2 inline-block" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-900 mb-2">Payment Cards</h1>
            <p className="text-green-800/70">Manage your payment methods securely</p>
          </div>
          <button 
            className="btn bg-green-600 text-white hover:bg-green-700 gap-2 shadow-lg"
            onClick={() => handleOpenModal()}
            disabled={isLoading}
          >
            <Plus className="w-5 h-5" /> {isLoading ? 'Processing...' : 'Add Card'}
          </button>
        </div>

        {isLoading && <div className="flex justify-center items-center py-12"><div className="loading loading-spinner loading-lg text-green-700"></div></div>}

        {!isLoading && cards.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-24 h-24 text-green-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">No cards added yet</h3>
            <p className="text-green-800/70 mb-6">Add your first payment card to get started</p>
            <button className="btn bg-green-600 text-white hover:bg-green-700 gap-2" onClick={() => handleOpenModal()}>
              <Plus className="w-5 h-5 mr-2" /> Add Your First Card
            </button>
          </div>
        )}

        {cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map(card => (
              <div key={card._id} className="relative group">
                <div 
                  className={`w-full h-56 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl ${getCardGradient(card.method)}`}
                >
                  <div className="p-6 text-white h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <Wifi className="w-6 h-6 rotate-90 opacity-80" />
                        <CreditCard className="w-8 h-8 opacity-80" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold tracking-wider">{card.method?.toUpperCase() || 'CARD'}</div>
                      </div>
                    </div>
                    <div className="text-xl font-mono tracking-widest mb-4">{formatCardNumber(card.card_no)}</div>
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="text-xs opacity-70 mb-1">CARD HOLDER</div>
                        <div className="font-medium">{formatCardName(card.card_holder_name)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-70 mb-1">EXPIRES</div>
                        <div className="font-medium">{formatExpiry(card.expiry_month, card.expiry_year)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="btn btn-sm bg-white/10 text-green-900 border border-green-300 hover:bg-green-200/20" onClick={() => handleOpenModal(card)}><Edit className="w-4 h-4" /></button>
                  <button className="btn btn-sm bg-red-100 text-red-700 border border-red-300 hover:bg-red-200/30" onClick={() => deleteCard(card._id)}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <EditCardForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleCloseModal={handleCloseModal}
            isLoading={isLoading}
            months={months}
            years={years}
          />
        )}
      </div>
    </div>
  );
}
