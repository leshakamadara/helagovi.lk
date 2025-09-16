import React from 'react';
import { useUser } from '../context/UserContext';

const FarmerDashboard = () => {
  const { user } = useUser();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Farmer Dashboard</h1>
      <div className="mb-4">Welcome, {user.name}!</div>
      {/* Ticket overview, quick create, recent chats, account status */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Active Tickets</h2>
            {/* TODO: List tickets */}
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Recent Chats</h2>
            {/* TODO: Recent chat messages */}
          </div>
        </div>
      </div>
      <button className="btn btn-primary mt-6">Create Ticket</button>
    </div>
  );
};

export default FarmerDashboard;
