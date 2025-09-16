import { Button, Card } from "shadcn-ui";
import { useUser } from "../../context/UserContext";

export default function FarmerDashboard() {
  const { user } = useUser();
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
      <div>Welcome, {user.name}!</div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Card.Header>Active Tickets</Card.Header>
          <Card.Content>{/* TODO: List tickets */}</Card.Content>
        </Card>
        <Card>
          <Card.Header>Recent Chats</Card.Header>
          <Card.Content>{/* TODO: Recent chat messages */}</Card.Content>
        </Card>
      </div>
      <Button className="mt-6">Create Ticket</Button>
    </div>
  );
}
