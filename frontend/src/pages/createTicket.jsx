import React, { useState } from 'react';
import { createTicket } from '../lib/api';
import { useUser } from '../context/UserContext';

const categories = ['Product', 'Payment', 'Technical', 'Account'];
const priorities = ['Low', 'Medium', 'High'];

const CreateTicket = () => {
  const { user } = useUser();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // TODO: handle file upload
      await createTicket({
        ...form,
        createdBy: user.userId
      });
      setSuccess(true);
      setForm({ title: '', description: '', category: categories[0], priority: priorities[1], file: null });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Support Ticket</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} required placeholder="Title" className="input input-bordered w-full" />
        <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="textarea textarea-bordered w-full" />
        <select name="category" value={form.category} onChange={handleChange} className="select select-bordered w-full">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select name="priority" value={form.priority} onChange={handleChange} className="select select-bordered w-full">
          {priorities.map(p => <option key={p}>{p}</option>)}
        </select>
        <input type="file" name="file" onChange={handleChange} className="file-input file-input-bordered w-full" />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</button>
        {error && <div className="text-error mt-2">{error}</div>}
        {success && <div className="text-success mt-2">Ticket created successfully!</div>}
      </form>
    </div>
  );
};

export default CreateTicket;
