import { Card } from "shadcn-ui";

export default function AgentDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agent Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Card.Header>Ticket Queue</Card.Header>
          <Card.Content>{/* TODO: Ticket queue */}</Card.Content>
        </Card>
        <Card>
          <Card.Header>Performance Metrics</Card.Header>
          <Card.Content>{/* TODO: Metrics */}</Card.Content>
        </Card>
      </div>
    </div>
  );
}
