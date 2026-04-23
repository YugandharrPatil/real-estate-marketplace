import { Button } from "@/components/ui/button";
import { Building2, CalendarCheck, Heart, MapPin } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="flex flex-col">
			{/* Hero */}
			<section className="relative flex items-center justify-center min-h-[70vh] bg-gradient-to-br from-primary/10 via-background to-accent/20 overflow-hidden">
				<div className="absolute inset-0 opacity-5">
					<div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary blur-3xl" />
					<div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-chart-1 blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-4 py-1.5 mb-6 text-sm text-muted-foreground">
						<Building2 className="h-4 w-4" />
						Your dream property awaits
					</div>
					<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
						Find Your Perfect <span className="text-primary">Property</span>
					</h1>
					<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">Browse thousands of listings, schedule visits, and connect directly with brokers — all in one modern marketplace.</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button variant="default" asChild>
							<Link href="/properties">
								<Building2 className="mr-2 h-4 w-4" /> Browse Properties
							</Link>
						</Button>
						<Button variant="secondary" asChild>
							<Link href="/map">
								<MapPin className="mr-2 h-4 w-4" /> Explore Map
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features strip */}
			<section className="border-t bg-muted/30">
				<div className="container mx-auto px-4 py-16 grid gap-8 sm:grid-cols-3 text-center">
					{[
						{
							icon: CalendarCheck,
							title: "Book Visits",
							desc: "Schedule in-person tours with one click and manage all your upcoming visits.",
						},
						{
							icon: Heart,
							title: "Save Favourites",
							desc: "Heart the properties you love and come back to them anytime.",
						},
						{
							icon: MapPin,
							title: "Map View",
							desc: "See every listing on an interactive map and explore neighbourhoods.",
						},
					].map(({ icon: Icon, title, desc }) => (
						<div key={title} className="space-y-3">
							<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<Icon className="h-6 w-6" />
							</div>
							<h3 className="font-semibold text-lg">{title}</h3>
							<p className="text-muted-foreground text-sm">{desc}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
