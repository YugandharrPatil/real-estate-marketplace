import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "EstateHub — Real Estate Marketplace",
	description: "Browse properties, book visits, and connect with brokers all in one place.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={`${inter.variable} font-sans antialiased`}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
						<QueryProvider>
							<Navbar />
							{children}
							<Toaster richColors />
						</QueryProvider>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
