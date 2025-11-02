import { db } from "./db";
import { applications, applicationBatches } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function backfillBatches() {
  console.log("🔄 Backfilling batch records for existing applications...");

  try {
    const existingApps = await db.select().from(applications);

    if (existingApps.length === 0) {
      console.log("ℹ️  No applications found. Nothing to backfill.");
      process.exit(0);
    }

    const userBatchMap = new Map<string, Set<number>>();

    for (const app of existingApps) {
      if (!userBatchMap.has(app.userId)) {
        userBatchMap.set(app.userId, new Set());
      }
      userBatchMap.get(app.userId)!.add(app.batchNumber);
    }

    let backfilledCount = 0;

    for (const [userId, batchNumbers] of userBatchMap.entries()) {
      for (const batchNumber of batchNumbers) {
        const existingBatch = await db
          .select()
          .from(applicationBatches)
          .where(
            sql`${applicationBatches.userId} = ${userId} AND ${applicationBatches.batchNumber} = ${batchNumber}`
          )
          .limit(1);

        if (existingBatch.length === 0) {
          const batchApps = existingApps.filter(
            (app) => app.userId === userId && app.batchNumber === batchNumber
          );

          await db.insert(applicationBatches).values({
            userId,
            batchNumber,
            status: "pending",
            submissionMode: "manual",
            totalApplications: batchApps.length,
          });

          backfilledCount++;
          console.log(`✅ Created batch ${batchNumber} for user ${userId} (${batchApps.length} apps)`);
        }
      }
    }

    console.log(`\n🎉 Backfill complete! Created ${backfilledCount} batch records.`);
    console.log(`   Total applications: ${existingApps.length}`);
    console.log(`   Total users with batches: ${userBatchMap.size}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error backfilling batches:", error);
    process.exit(1);
  }
}

backfillBatches();
