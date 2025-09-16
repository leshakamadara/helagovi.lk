import React from 'react';

const AgentDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Dashboard</h1>
      {/* Ticket queue, assigned tickets, live chat notifications, metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Ticket Queue</h2>
            {/* TODO: Ticket queue */}
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Performance Metrics</h2>
            {/* TODO: Metrics */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
