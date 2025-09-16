import React from 'react';
import { useUser } from '../context/UserContext';

const BuyerDashboard = () => {
  const { user } = useUser();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
      <div className="mb-4">Welcome, {user.name}!</div>
      {/* Ticket overview, recent purchases, quick access to issues, live chat */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Order Tickets</h2>
            {/* TODO: List tickets */}
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Purchases Support</h2>
            {/* TODO: Recent purchases support */}
          </div>
        </div>
      </div>
      <button className="btn btn-primary mt-6">Create Ticket</button>
    </div>
  );
};

export default BuyerDashboard;
