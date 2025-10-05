#!/usr/bin/env node
/**
 * RDX Command-Line Interface
 * Interactive tool for Recognition Derivatives Exchange (Decentralized)
 */

import { Command } from "commander";
import chalk from "chalk";
import { randomBytes } from "crypto";
import { HolsterStorage } from "./holster-storage.js";
import { createRecognitionValue, createCapacity } from "./rdx-core.js";
import { commit as createCommitment } from "./crypto-core.js";
import { MPCProtocol } from "./crypto-core.js";

// Global storage instance (initialized on first command)
let storage: HolsterStorage | null = null;
let userId: string | null = null;

/**
 * Initialize storage with user ID
 */
async function initStorage(did: string): Promise<HolsterStorage> {
  if (storage && userId === did) {
    return storage;
  }

  console.log(
    chalk.blue(`\n🔗 Initializing decentralized storage for ${did}...`)
  );
  storage = new HolsterStorage({ indexedDB: false }); // Use filesystem for CLI
  await storage.initialize(did);
  userId = did;
  console.log(chalk.green("✅ Storage initialized\n"));

  return storage;
}

const program = new Command();

program
  .name("rdx")
  .description("Recognition Derivatives Exchange - CLI Tool")
  .version("1.0.0");

// ============================================================================
// Register Command
// ============================================================================

program
  .command("register")
  .description(
    "Register a new participant (initializes your decentralized storage)"
  )
  .requiredOption(
    "--did <did>",
    "Decentralized Identifier (e.g., did:example:alice)"
  )
  .requiredOption("--name <name>", "Participant name")
  .option("--public-key <key>", "Public key (optional)")
  .action(async (options) => {
    try {
      console.log(chalk.blue("\n🔐 Registering participant..."));
      console.log(chalk.gray(`   DID: ${options.did}`));
      console.log(chalk.gray(`   Name: ${options.name}`));

      const publicKey =
        options.publicKey ||
        randomBytes(32).toString("hex").slice(0, 16) + "...";

      const store = await initStorage(options.did);
      store.addParticipant(options.did, options.name, publicKey);

      console.log(chalk.green(`\n✅ Successfully registered ${options.name}`));
      console.log(chalk.gray("   Your decentralized storage is ready."));
      console.log(
        chalk.gray("   You can now declare capacities and express desires.\n")
      );
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// List Participants Command
// ============================================================================

program
  .command("list-participants")
  .description("List all registered participants")
  .requiredOption("--did <did>", "Your DID (for storage access)")
  .action(async (options) => {
    try {
      const store = await initStorage(options.did);
      const participants = await store.listParticipants();

      if (participants.length === 0) {
        console.log(chalk.yellow("\n⚠️  No participants registered yet.\n"));
        return;
      }

      console.log(chalk.blue("\n👥 Registered Participants:\n"));
      console.log(chalk.gray("─".repeat(70)));

      for (const p of participants) {
        console.log(chalk.white(`  ${p.name}`));
        console.log(chalk.gray(`  DID: ${p.did}`));
        if (p.publicKey) {
          console.log(chalk.gray(`  Key: ${p.publicKey}`));
        }
        console.log(chalk.gray("─".repeat(70)));
      }
      console.log();
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Set Recognition Command
// ============================================================================

program
  .command("set-recognition")
  .description("Set recognition value between two participants")
  .requiredOption("--from-did <did>", "Recognition from this DID")
  .requiredOption("--to-did <did>", "Recognition to this DID")
  .requiredOption(
    "--percentage <value>",
    "Recognition percentage (0-100)",
    parseFloat
  )
  .action(async (options) => {
    try {
      const store = await initStorage(options.fromDid);
      const fromParticipant = await store.getParticipant(options.fromDid);
      const toParticipant = await store.getParticipant(options.toDid);

      if (!fromParticipant) {
        throw new Error(`Participant ${options.fromDid} not found`);
      }
      if (!toParticipant) {
        throw new Error(`Participant ${options.toDid} not found`);
      }

      console.log(chalk.blue("\n🤝 Setting recognition:"));
      console.log(chalk.gray(`   From: ${options.fromDid}`));
      console.log(chalk.gray(`   To: ${options.toDid}`));
      console.log(chalk.gray(`   Recognition: ${options.percentage}%`));

      // Create commitment
      const recognition = createRecognitionValue(options.percentage);
      const randomness = randomBytes(32);
      const commitment = createCommitment(recognition.percentage, randomness);

      console.log(chalk.blue("\n🔒 Creating cryptographic commitment..."));

      // Store commitment
      store.addCommitment(
        options.fromDid,
        options.toDid,
        commitment.value,
        commitment.randomness
      );

      console.log(
        chalk.green("✅ Recognition commitment stored (syncing to network)")
      );
      console.log(
        chalk.gray(
          `   Commitment: ${Buffer.from(commitment.value).toString("hex").slice(0, 32)}...`
        )
      );
      console.log(chalk.gray("   (Recognition value is kept private)\n"));
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Declare Capacity Command
// ============================================================================

program
  .command("declare-capacity")
  .description("Declare a new capacity (syncs to network)")
  .requiredOption("--provider-did <did>", "Provider DID")
  .requiredOption("--type <type>", "Capacity type (e.g., piano_lessons)")
  .requiredOption("--quantity <value>", "Total quantity", parseFloat)
  .requiredOption("--unit <unit>", "Unit (e.g., hours/week)")
  .option("--filters <json>", "Filters as JSON", "{}")
  .action(async (options) => {
    try {
      const store = await initStorage(options.providerDid);
      const provider = await store.getParticipant(options.providerDid);
      if (!provider) {
        throw new Error(`Provider ${options.providerDid} not found`);
      }

      console.log(chalk.blue("\n📦 Declaring capacity:"));
      console.log(chalk.gray(`   Provider: ${options.providerDid}`));
      console.log(chalk.gray(`   Type: ${options.type}`));
      console.log(
        chalk.gray(`   Quantity: ${options.quantity} ${options.unit}`)
      );

      const capacityId = `cap-${randomBytes(8).toString("hex")}`;
      const filters = JSON.parse(options.filters);

      const capacity = createCapacity(
        capacityId,
        options.providerDid,
        options.type,
        options.quantity,
        options.unit,
        filters
      );

      store.addCapacity(capacity);

      console.log(
        chalk.green("\n✅ Capacity declared successfully (syncing to network)")
      );
      console.log(chalk.gray(`   Capacity ID: ${capacityId}`));
      console.log(
        chalk.gray("   Recipients can now express desire for this capacity\n")
      );
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// List Capacities Command
// ============================================================================

program
  .command("list-capacities")
  .description("List all declared capacities (from network)")
  .requiredOption("--did <did>", "Your DID (for storage access)")
  .option("--provider <did>", "Filter by provider DID")
  .action(async (options) => {
    try {
      const store = await initStorage(options.did);
      const capacities = await store.listCapacities(options.provider);

      if (capacities.length === 0) {
        console.log(chalk.yellow("\n⚠️  No capacities declared yet.\n"));
        return;
      }

      console.log(chalk.blue("\n📦 Available Capacities:\n"));
      console.log(chalk.gray("─".repeat(70)));

      for (const c of capacities) {
        console.log(chalk.white(`  ${c.capacityType}`));
        console.log(chalk.gray(`  ID: ${c.id}`));
        console.log(chalk.gray(`  Provider: ${c.providerDid}`));
        console.log(chalk.gray(`  Quantity: ${c.totalQuantity} ${c.unit}`));
        console.log(chalk.gray("─".repeat(70)));
      }
      console.log();
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Express Desire Command
// ============================================================================

program
  .command("express-desire")
  .description("Express desire for a capacity (syncs to network)")
  .requiredOption("--recipient-did <did>", "Recipient DID")
  .requiredOption("--capacity-id <id>", "Capacity ID")
  .requiredOption("--quantity <value>", "Desired quantity", parseFloat)
  .action(async (options) => {
    try {
      const store = await initStorage(options.recipientDid);
      const recipient = await store.getParticipant(options.recipientDid);
      if (!recipient) {
        throw new Error(`Recipient ${options.recipientDid} not found`);
      }

      const capacity = await store.getCapacity(options.capacityId);
      if (!capacity) {
        throw new Error(`Capacity ${options.capacityId} not found`);
      }

      console.log(chalk.blue("\n💭 Expressing desire:"));
      console.log(chalk.gray(`   Recipient: ${options.recipientDid}`));
      console.log(chalk.gray(`   Capacity: ${options.capacityId}`));
      console.log(chalk.gray(`   Quantity: ${options.quantity}`));

      store.addDesire(
        options.recipientDid,
        options.capacityId,
        options.quantity
      );

      console.log(
        chalk.green("\n✅ Desire expressed successfully (syncing to network)")
      );
      console.log(
        chalk.gray("   Use compute-allocation to calculate allocations\n")
      );
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Compute Allocation Command
// ============================================================================

program
  .command("compute-allocation")
  .description("Compute allocations for a capacity")
  .requiredOption("--provider-did <did>", "Provider DID (for storage access)")
  .requiredOption("--capacity-id <id>", "Capacity ID")
  .option("--use-tee", "Use TEE simulation", false)
  .action(async (options) => {
    try {
      const store = await initStorage(options.providerDid);
      const capacity = await store.getCapacity(options.capacityId);
      if (!capacity) {
        throw new Error(`Capacity ${options.capacityId} not found`);
      }

      console.log(
        chalk.blue("\n⚙️  Computing allocation for capacity:", capacity.id)
      );
      console.log(chalk.gray(`   Provider: ${capacity.providerDid}`));
      console.log(
        chalk.gray(`   Total: ${capacity.totalQuantity} ${capacity.unit}`)
      );

      // Get desires
      const desires = await store.getDesires(options.capacityId);
      console.log(chalk.blue(`\n📊 Found ${desires.length} desire(s)\n`));

      if (desires.length === 0) {
        console.log(
          chalk.yellow("⚠️  No desires expressed for this capacity.\n")
        );
        return;
      }

      // Get commitments and compute MR
      const mpc = new MPCProtocol(3);
      const mrShares: Record<string, any> = {};
      const desireMap: Record<string, number> = {};

      for (const desire of desires) {
        console.log(
          chalk.gray(`   Processing recipient: ${desire.recipientDid}`)
        );

        // Get commitments
        const commitmentProv = await store.getCommitment(
          capacity.providerDid,
          desire.recipientDid
        );
        const commitmentRecip = await store.getCommitment(
          desire.recipientDid,
          capacity.providerDid
        );

        if (!commitmentProv || !commitmentRecip) {
          console.log(chalk.yellow(`   ⚠️  Missing commitments, skipping...`));
          continue;
        }

        // For demo, assume we can reconstruct (in reality, this would be MPC)
        // Here we're simulating with placeholder values
        const mrValue = 15.0; // Simplified for demo
        mrShares[desire.recipientDid] = mpc.secretShare(mrValue, 3);
        desireMap[desire.recipientDid] = desire.quantity;
      }

      console.log(chalk.blue("\n🔐 Running secure computation...\n"));

      // Compute allocation
      const allocations = mpc.computeNormalizedAllocation(
        mrShares,
        capacity.totalQuantity,
        desireMap
      );

      console.log(chalk.green("✅ Allocation computed successfully!\n"));
      console.log(chalk.blue("📊 Results:\n"));
      console.log(chalk.gray("─".repeat(70)));

      for (const [recipientDid, quantity] of Object.entries(allocations)) {
        console.log(chalk.white(`   Recipient: ${recipientDid}`));
        console.log(
          chalk.green(`   Allocated: ${quantity.toFixed(2)} ${capacity.unit}`)
        );
        console.log(chalk.gray("─".repeat(70)));

        // Store allocation
        store.addAllocation({
          capacityId: capacity.id,
          recipientDid,
          quantityAllocated: quantity,
          confirmed: false,
        } as any);
      }

      if (options.useTee) {
        console.log(
          chalk.blue("\n🔐 TEE Attestation: RDX_Allocation_Enclave_v1")
        );
      }

      console.log();
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Show Allocation Command
// ============================================================================

program
  .command("show-allocation")
  .description("Show allocation for a capacity (from network)")
  .requiredOption("--did <did>", "Your DID (for storage access)")
  .requiredOption("--capacity-id <id>", "Capacity ID")
  .action(async (options) => {
    try {
      const store = await initStorage(options.did);
      const capacity = await store.getCapacity(options.capacityId);
      if (!capacity) {
        throw new Error(`Capacity ${options.capacityId} not found`);
      }

      const allocations = await store.getAllocations(options.capacityId);

      if (allocations.length === 0) {
        console.log(chalk.yellow("\n⚠️  No allocations computed yet.\n"));
        return;
      }

      console.log(chalk.blue("\n📊 Allocations:\n"));
      console.log(chalk.gray("─".repeat(70)));

      for (const alloc of allocations) {
        console.log(chalk.white(`   Recipient: ${alloc.recipientDid}`));
        console.log(
          chalk.green(
            `   Allocated: ${alloc.quantityAllocated} ${capacity.unit}`
          )
        );
        console.log(
          chalk.gray(`   Confirmed: ${alloc.confirmed ? "Yes" : "No"}`)
        );
        console.log(chalk.gray("─".repeat(70)));
      }
      console.log();
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ============================================================================
// Parse and Execute
// ============================================================================

program.parse();
