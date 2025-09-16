import { useState } from "react";
import { Button, Input, Select, Card } from "shadcn-ui";
import { createTicket } from "../../lib/api";
import { useUser } from "../../context/UserContext";

const categories = ["Product", "Payment", "Technical", "Account"];
const priorities = ["Low", "Medium", "High"];

export default function CreateTicket() {
  const { user } = useUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    priority: priorities[1],
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // TODO: handle file upload
      await createTicket({ ...form, createdBy: user.userId });
      setSuccess(true);
      setForm({ title: "", description: "", category: categories[0], priority: priorities[1], file: null });
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl mx-auto p-6">
      <Card.Header>Create Support Ticket</Card.Header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input name="title" value={form.title} onChange={handleChange} required placeholder="Title" />
        <Input as="textarea" name="description" value={form.description} onChange={handleChange} required placeholder="Description" />
        <Select name="category" value={form.category} onChange={handleChange} options={categories} />
        <Select name="priority" value={form.priority} onChange={handleChange} options={priorities} />
        <Input type="file" name="file" onChange={handleChange} />
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Submitting..." : "Submit Ticket"}</Button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-500 mt-2">Ticket created successfully!</div>}
      </form>
    </Card>
  );
}
