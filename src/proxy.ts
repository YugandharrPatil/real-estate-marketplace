import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/saved(.*)", "/visits(.*)"]);

const isAdminRoute = createRouteMatcher(["/admin", "/admin/(.*)"]);
const isAdminLoginPage = createRouteMatcher(["/admin-login"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId, sessionClaims } = await auth();
	const role = (sessionClaims?.metadata as { role?: string })?.role;
	const email = (sessionClaims as { email?: string })?.email;
	const isAdmin = role === "admin" || email === "admin@rental.com";

	// Redirect logged-in admin from login page to dashboard
	if (isAdminLoginPage(req) && userId && isAdmin) {
		return NextResponse.redirect(new URL("/admin", req.url));
	}

	// Protect admin routes — require admin role
	if (isAdminRoute(req)) {
		if (!userId) {
			const signInUrl = new URL("/sign-in", req.url);
			signInUrl.searchParams.set("redirect_url", req.url);
			return NextResponse.redirect(signInUrl);
		}

		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const userEmail = user.primaryEmailAddress?.emailAddress;
		const userRole = (user.publicMetadata as { role?: string })?.role;
		const isAdminUser = userRole === "admin" || userEmail === "admin@rental.com";

		if (!isAdminUser) {
			return NextResponse.redirect(new URL("/", req.url));
		}
	}

	// Protect user routes — require sign-in
	if (isProtectedRoute(req)) {
		if (!userId) {
			const signInUrl = new URL("/sign-in", req.url);
			signInUrl.searchParams.set("redirect_url", req.url);
			return NextResponse.redirect(signInUrl);
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals and static files
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
