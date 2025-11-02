import { db } from "./db";
import { users, plans, userPlans, applications } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seedTestData() {
  console.log("🌱 Seeding test data...");

  try {
    const testEmail = "test@example.com";
    let testUser = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);

    if (testUser.length === 0) {
      const hashedPassword = await bcrypt.hash("test123", 10);
      const newUser = await db.insert(users).values({
        email: testEmail,
        password: hashedPassword,
        role: "user",
      }).returning();
      testUser = newUser;
      console.log(`✅ Created test user (${testEmail} / test123)`);
    } else {
      console.log(`ℹ️  Test user already exists`);
    }

    const userId = testUser[0].id;

    const professionalPlan = await db
      .select()
      .from(plans)
      .where(eq(plans.sku, "APPS_150"))
      .limit(1);

    if (professionalPlan.length === 0) {
      console.log("❌ Professional plan not found. Run seed.ts first!");
      process.exit(1);
    }

    const planId = professionalPlan[0].id;

    const existingUserPlan = await db
      .select()
      .from(userPlans)
      .where(eq(userPlans.userId, userId))
      .limit(1);

    let userPlanId: string;

    const sampleAppCount = 7;
    
    if (existingUserPlan.length === 0) {
      const newUserPlan = await db.insert(userPlans).values({
        userId,
        planId,
        creditsRemaining: 150 - sampleAppCount,
      }).returning();
      userPlanId = newUserPlan[0].id;
      console.log(`✅ Created user plan with ${150 - sampleAppCount} credits (150 - ${sampleAppCount} sample apps)`);
    } else {
      userPlanId = existingUserPlan[0].id;
      console.log(`ℹ️  User plan already exists`);
    }

    const existingApps = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    if (existingApps.length === 0) {
      const sampleApplications = [
        {
          userId,
          userPlanId,
          jobId: "JOB-001",
          jobTitle: "Senior Software Engineer",
          company: "Tech Innovations Ltd",
          status: "applied" as const,
          batchNumber: 1,
          appliedDate: new Date("2025-01-10"),
        },
        {
          userId,
          userPlanId,
          jobId: "JOB-002",
          jobTitle: "Full Stack Developer",
          company: "Digital Solutions Inc",
          status: "in_review" as const,
          batchNumber: 1,
          appliedDate: new Date("2025-01-11"),
        },
        {
          userId,
          userPlanId,
          jobId: "JOB-003",
          jobTitle: "Frontend Engineer",
          company: "Creative Agency",
          status: "interviewing" as const,
          batchNumber: 1,
          appliedDate: new Date("2025-01-12"),
        },
        {
          userId,
          userPlanId,
          jobId: "JOB-004",
          jobTitle: "Backend Developer",
          company: "Cloud Services Co",
          status: "rejected" as const,
          batchNumber: 1,
          appliedDate: new Date("2025-01-13"),
        },
        {
          userId,
          userPlanId,
          jobId: "JOB-005",
          jobTitle: "DevOps Engineer",
          company: "Infrastructure Plus",
          status: "offer" as const,
          batchNumber: 1,
          appliedDate: new Date("2025-01-14"),
        },
        {
          userId,
          userPlanId,
          jobTitle: "Product Manager",
          company: "Startup Ventures",
          status: "applied" as const,
          batchNumber: 2,
          appliedDate: new Date("2025-01-20"),
        },
        {
          userId,
          userPlanId,
          jobTitle: "UI/UX Designer",
          company: "Design Studio",
          status: "in_review" as const,
          batchNumber: 2,
          appliedDate: new Date("2025-01-21"),
        },
      ];

      await db.insert(applications).values(sampleApplications);
      console.log(`✅ Created ${sampleApplications.length} sample applications`);
    } else {
      console.log(`ℹ️  Applications already exist (${existingApps.length} found)`);
    }

    console.log("🎉 Test data seeding complete!");
    console.log(`\n📝 Test credentials:`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: test123`);
    console.log(`   Credits: 143 (150 - 7 sample apps)`);
    console.log(`   Sample applications: 7\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    process.exit(1);
  }
}

seedTestData();
