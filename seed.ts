import "dotenv/config";
import { db } from "./src/db";
import { reProperties, reInquiries, reVisits } from "./src/db/schema";

async function seed() {
	console.log("🌱 Seeding database...");

	// Insert properties first (referenced by inquiries and visits)
	await db.insert(reProperties).values([
		{
			id: "5cd07333-b3c3-4859-9f66-5b5688eeb9f2",
			title: "Charming Garden Townhouse",
			description: "A spacious 3-bedroom townhouse with a private backyard and terrace garden. Located in a quiet gated community with a park and swimming pool.",
			price: 18500000.0,
			address: "45 Green Valley Lane, Sector 62",
			city: "Noida",
			state: "Uttar Pradesh",
			zip: "201301",
			bedrooms: 3,
			bathrooms: 3,
			area_sqft: 2100,
			property_type: "townhouse",
			status: "pending",
			latitude: 28.6273,
			longitude: 77.3725,
			images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200"],
			created_at: "2026-03-16T11:08:51.931Z",
			updated_at: "2026-03-16T11:08:51.931Z",
		},
		{
			id: "5ef7edbc-08b4-4cc5-b7a5-73bddc284aac",
			title: "Modern Luxury Villa with Private Pool",
			description: "A stunning 4-bedroom villa featuring modern architecture, an open-concept living area, and a private infinity pool overlooking the city hills. Perfect for families seeking luxury and privacy.",
			price: 85000000.0,
			address: "123 Skyline Terrace, Worli",
			city: "Mumbai",
			state: "Maharashtra",
			zip: "400018",
			bedrooms: 4,
			bathrooms: 5,
			area_sqft: 4500,
			property_type: "house",
			status: "available",
			latitude: 18.9986,
			longitude: 72.8174,
			images: [
				"https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
				"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
			],
			created_at: "2026-03-16T11:08:51.931Z",
			updated_at: "2026-03-17T06:08:37.619Z",
		},
		{
			id: "c40fc8a2-a864-4823-9df7-10b0ec23e791",
			title: "Sexy Ass Apartment",
			description: "Luxury 2-bedroom apartment on the 45th floor with floor-to-ceiling windows. Features include a modular kitchen, designer bathrooms, and 24/7 concierge service.",
			price: 25000000.0,
			address: "Tower A, Emerald Heights, MG Road",
			city: "Bangalore",
			state: "Karnataka",
			zip: "560001",
			bedrooms: 2,
			bathrooms: 2,
			area_sqft: 1250,
			property_type: "apartment",
			status: "available",
			latitude: 12.9716,
			longitude: 77.5946,
			images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200"],
			created_at: "2026-03-16T11:08:51.931Z",
			updated_at: "2026-03-17T06:09:36.591Z",
		},
		{
			id: "d94d5861-2ca4-4884-86fa-907255f5956c",
			title: "Premium Office Space in Tech Hub",
			description: "Fully furnished commercial office space in the heart of the business district. Equipped with meeting rooms, workstations, and high-speed fiber internet.",
			price: 45000000.0,
			address: "8th Floor, Global Tech Park, HITEC City",
			city: "Hyderabad",
			state: "Telangana",
			zip: "500081",
			bedrooms: 0,
			bathrooms: 2,
			area_sqft: 3200,
			property_type: "commercial",
			status: "available",
			latitude: 17.4483,
			longitude: 78.3915,
			images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"],
			created_at: "2026-03-16T11:08:51.931Z",
			updated_at: "2026-03-16T11:08:51.931Z",
		},
		{
			id: "e86328d5-f499-4292-9427-1ec135f709fb",
			title: "Cozy City Condo",
			description: "Compact and efficient 1-bedroom condo ideal for young professionals. Move-in ready with modern fixtures and close proximity to the metro station.",
			price: 12000000.0,
			address: "302 Pearl residency, Gachibowli",
			city: "Hyderabad",
			state: "Telangana",
			zip: "500032",
			bedrooms: 1,
			bathrooms: 1,
			area_sqft: 750,
			property_type: "condo",
			status: "sold",
			latitude: 17.4401,
			longitude: 78.3489,
			images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200"],
			created_at: "2026-03-16T11:08:51.931Z",
			updated_at: "2026-03-16T11:08:51.931Z",
		},
	]);
	console.log("✅ Properties seeded");

	// Insert inquiries
	await db.insert(reInquiries).values([
		{
			id: "0115a8ca-6e23-4173-80e1-8e5ca01106f2",
			user_id: "user_3B1bKWdClNlPvmdnBrAWm1WgNda",
			name: "Yugandhar Patil",
			email: "thisistheyugandhar@gmail.com",
			phone: null,
			message: "ndrfnbdfgn",
			property_id: "5cd07333-b3c3-4859-9f66-5b5688eeb9f2",
			created_at: "2026-04-23T15:37:56.680Z",
		},
		{
			id: "be17ac57-3940-4b24-8472-96cca296c2a3",
			user_id: "user_3B1bKWdClNlPvmdnBrAWm1WgNda",
			name: "Yugandhar Patil",
			email: "thisistheyugandhar@gmail.com",
			phone: "246426346",
			message: "fking nice property!",
			property_id: "5cd07333-b3c3-4859-9f66-5b5688eeb9f2",
			created_at: "2026-03-17T06:21:54.890Z",
		},
		{
			id: "e71910b4-0c44-4ee9-b1f1-4414d65ad48f",
			user_id: "user_3B1bKWdClNlPvmdnBrAWm1WgNda",
			name: "Yugandhar Patil",
			email: "thisistheyugandhar@gmail.com",
			phone: null,
			message: "message",
			property_id: "5cd07333-b3c3-4859-9f66-5b5688eeb9f2",
			created_at: "2026-04-23T16:32:49.534Z",
		},
	]);
	console.log("✅ Inquiries seeded");

	// Insert visits
	await db.insert(reVisits).values([
		{
			id: "88539e86-fb43-4fed-b969-affc36527800",
			property_id: "e86328d5-f499-4292-9427-1ec135f709fb",
			user_id: "user_3B1bKWdClNlPvmdnBrAWm1WgNda",
			user_name: "Yugandhar Patil",
			user_email: "thisistheyugandhar@gmail.com",
			visit_date: "2026-04-28",
			visit_time: "10:00",
			status: "cancelled",
			created_at: "2026-04-24T10:28:34.842Z",
		},
		{
			id: "9db9a79b-40ac-4ef5-87af-734984124d48",
			property_id: "d94d5861-2ca4-4884-86fa-907255f5956c",
			user_id: "user_3B1bKWdClNlPvmdnBrAWm1WgNda",
			user_name: "Yugandhar Patil",
			user_email: "thisistheyugandhar@gmail.com",
			visit_date: "2026-06-04",
			visit_time: "11:12",
			status: "cancelled",
			created_at: "2026-04-24T09:54:09.973Z",
		},
		{
			id: "fc2160d6-af4d-494a-a412-0d26a7efaf4b",
			property_id: "5cd07333-b3c3-4859-9f66-5b5688eeb9f2",
			user_id: "user_3B1bKWdClNlPvmdnBrAWm1WgNda",
			user_name: "Yugandhar Patil",
			user_email: "thisistheyugandhar@gmail.com",
			visit_date: "2026-04-25",
			visit_time: "12:00",
			status: "cancelled",
			created_at: "2026-04-23T16:46:11.741Z",
		},
	]);
	console.log("✅ Visits seeded");

	console.log("🎉 Database seeded successfully!");
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
