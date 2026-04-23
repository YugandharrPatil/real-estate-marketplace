import { ChatWidget } from "@/components/chat-widget";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex flex-col">
			{children}
			<ChatWidget />
		</div>
	);
}
