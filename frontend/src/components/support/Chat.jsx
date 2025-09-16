
import { useState } from "react";
import { Button } from "./Button";

export default function Chat({ ticketId, messages = [], onSendMessage }) {
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);

	const handleSend = async () => {
		if (!input.trim()) return;
		setSending(true);
		await onSendMessage?.(input);
		setInput("");
		setSending(false);
	};

	return (
		<div className="border rounded-lg p-4 bg-background mt-4">
			<div className="mb-4 max-h-64 overflow-y-auto">
				{messages.length === 0 ? (
					<div className="text-gray-400 text-sm">No messages yet.</div>
				) : (
					messages.map((msg, idx) => (
						<div key={idx} className={`mb-2 flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
							<div className={`px-3 py-2 rounded-lg text-sm ${msg.isOwn ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}>
								<span className="font-semibold mr-2">{msg.senderName}</span>
								{msg.message}
								<span className="ml-2 text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
							</div>
						</div>
					))
				)}
			</div>
			<div className="flex gap-2">
				<input
					type="text"
					className="input input-bordered flex-1"
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder="Type your message..."
					disabled={sending}
				/>
				<Button onClick={handleSend} disabled={sending || !input.trim()}>
					Send
				</Button>
			</div>
		</div>
	);
}
