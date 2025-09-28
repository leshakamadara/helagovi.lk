import React from 'react';
import { X, User, Calendar } from 'lucide-react';

export default function EditCardForm({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  handleCloseModal, 
  isLoading, 
  months, 
  years 
}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box backdrop-blur-md bg-black/90 border border-white/20 text-white max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">Edit Card Details</h3>
          <button 
            className="btn btn-sm btn-circle glass text-white"
            onClick={handleCloseModal}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white/80">
                <User className="w-4 h-4 inline mr-2" />
                Card Name
              </span>
            </label>
            <input 
              type="text"
              name="card_name" 
              value={formData.card_name} 
              onChange={handleInputChange}
              placeholder="Enter a unique name for this card"
              className="input glass w-full text-white placeholder-white/50 border-white/20 focus:border-white/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white/80">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Month
                </span>
              </label>
              <select 
                name="expiry_month" 
                value={formData.expiry_month} 
                onChange={handleInputChange}
                className="select glass w-full text-white border-white/20 focus:border-white/40"
                required
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value} className="bg-black">
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white/80">Year</span>
              </label>
              <select 
                name="expiry_year" 
                value={formData.expiry_year} 
                onChange={handleInputChange}
                className="select glass w-full text-white border-white/20 focus:border-white/40"
                required
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year} className="bg-black">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-action pt-6">
            <button 
              className="btn glass text-white border-white/20"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button 
              className="btn glass text-white border-white/20 bg-blue-500/20 hover:bg-blue-500/30"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Card'}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop backdrop-blur-sm" onClick={handleCloseModal}></div>
    </div>
  );
}
