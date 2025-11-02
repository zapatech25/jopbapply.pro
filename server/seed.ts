import { db } from "./db";
import { users, plans } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    const adminEmail = "admin@jobapply.pro";
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅ Created admin user (admin@jobapply.pro / admin123)");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    const seedPlans = [
      {
        sku: "TRIAL_10",
        name: "Trial",
        description: "Perfect for testing our service",
        credits: 10,
        price: "9.00",
        active: true,
      },
      {
        sku: "APPS_150",
        name: "Professional",
        description: "Perfect for active job seekers",
        credits: 150,
        price: "79.00",
        active: true,
      },
      {
        sku: "APPS_300",
        name: "Premium",
        description: "For serious job hunters",
        credits: 300,
        price: "139.00",
        active: true,
      },
      {
        sku: "APPS_500",
        name: "Professional Plus",
        description: "Maximum application volume",
        credits: 500,
        price: "199.00",
        active: true,
      },
      {
        sku: "APPS_1000",
        name: "Enterprise",
        description: "Unlimited opportunities",
        credits: 1000,
        price: "349.00",
        active: true,
      },
      {
        sku: "CV_RETOUCH",
        name: "CV Enhancement",
        description: "Professional CV review service",
        credits: 0,
        price: "39.00",
        active: true,
      },
    ];

    for (const plan of seedPlans) {
      const existing = await db.select().from(plans).where(eq(plans.sku, plan.sku)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(plans).values(plan);
        console.log(`✅ Created plan: ${plan.name} (${plan.sku})`);
      } else {
        console.log(`ℹ️  Plan ${plan.sku} already exists`);
      }
    }

    console.log("🎉 Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
