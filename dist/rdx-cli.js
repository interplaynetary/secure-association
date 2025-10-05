#!/usr/bin/env node
import { Command as w } from "commander";
import e from "chalk";
import { randomBytes as y } from "crypto";
import { b as $, c as h, e as v, M as I, H as q } from "./holster-storage-KQhu2mn3.js";
let g = null, u = null;
async function l(o) {
  return g && u === o || (console.log(
    e.blue(`
🔗 Initializing decentralized storage for ${o}...`)
  ), g = new q({ indexedDB: !1 }), await g.initialize(o), u = o, console.log(e.green(`✅ Storage initialized
`))), g;
}
const c = new w();
c.name("rdx").description("Recognition Derivatives Exchange - CLI Tool").version("1.0.0");
c.command("register").description(
  "Register a new participant (initializes your decentralized storage)"
).requiredOption(
  "--did <did>",
  "Decentralized Identifier (e.g., did:example:alice)"
).requiredOption("--name <name>", "Participant name").option("--public-key <key>", "Public key (optional)").action(async (o) => {
  try {
    console.log(e.blue(`
🔐 Registering participant...`)), console.log(e.gray(`   DID: ${o.did}`)), console.log(e.gray(`   Name: ${o.name}`));
    const i = o.publicKey || y(32).toString("hex").slice(0, 16) + "...";
    (await l(o.did)).addParticipant(o.did, o.name, i), console.log(e.green(`
✅ Successfully registered ${o.name}`)), console.log(e.gray("   Your decentralized storage is ready.")), console.log(
      e.gray(`   You can now declare capacities and express desires.
`)
    );
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("list-participants").description("List all registered participants").requiredOption("--did <did>", "Your DID (for storage access)").action(async (o) => {
  try {
    const t = await (await l(o.did)).listParticipants();
    if (t.length === 0) {
      console.log(e.yellow(`
⚠️  No participants registered yet.
`));
      return;
    }
    console.log(e.blue(`
👥 Registered Participants:
`)), console.log(e.gray("─".repeat(70)));
    for (const r of t)
      console.log(e.white(`  ${r.name}`)), console.log(e.gray(`  DID: ${r.did}`)), r.publicKey && console.log(e.gray(`  Key: ${r.publicKey}`)), console.log(e.gray("─".repeat(70)));
    console.log();
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("set-recognition").description("Set recognition value between two participants").requiredOption("--from-did <did>", "Recognition from this DID").requiredOption("--to-did <did>", "Recognition to this DID").requiredOption(
  "--percentage <value>",
  "Recognition percentage (0-100)",
  parseFloat
).action(async (o) => {
  try {
    const i = await l(o.fromDid), t = await i.getParticipant(o.fromDid), r = await i.getParticipant(o.toDid);
    if (!t)
      throw new Error(`Participant ${o.fromDid} not found`);
    if (!r)
      throw new Error(`Participant ${o.toDid} not found`);
    console.log(e.blue(`
🤝 Setting recognition:`)), console.log(e.gray(`   From: ${o.fromDid}`)), console.log(e.gray(`   To: ${o.toDid}`)), console.log(e.gray(`   Recognition: ${o.percentage}%`));
    const a = $(o.percentage), s = y(32), d = h(a.percentage, s);
    console.log(e.blue(`
🔒 Creating cryptographic commitment...`)), i.addCommitment(
      o.fromDid,
      o.toDid,
      d.value,
      d.randomness
    ), console.log(
      e.green("✅ Recognition commitment stored (syncing to network)")
    ), console.log(
      e.gray(
        `   Commitment: ${Buffer.from(d.value).toString("hex").slice(0, 32)}...`
      )
    ), console.log(e.gray(`   (Recognition value is kept private)
`));
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("declare-capacity").description("Declare a new capacity (syncs to network)").requiredOption("--provider-did <did>", "Provider DID").requiredOption("--type <type>", "Capacity type (e.g., piano_lessons)").requiredOption("--quantity <value>", "Total quantity", parseFloat).requiredOption("--unit <unit>", "Unit (e.g., hours/week)").option("--filters <json>", "Filters as JSON", "{}").action(async (o) => {
  try {
    const i = await l(o.providerDid);
    if (!await i.getParticipant(o.providerDid))
      throw new Error(`Provider ${o.providerDid} not found`);
    console.log(e.blue(`
📦 Declaring capacity:`)), console.log(e.gray(`   Provider: ${o.providerDid}`)), console.log(e.gray(`   Type: ${o.type}`)), console.log(
      e.gray(`   Quantity: ${o.quantity} ${o.unit}`)
    );
    const r = `cap-${y(8).toString("hex")}`, a = JSON.parse(o.filters), s = v(
      r,
      o.providerDid,
      o.type,
      o.quantity,
      o.unit,
      a
    );
    i.addCapacity(s), console.log(
      e.green(`
✅ Capacity declared successfully (syncing to network)`)
    ), console.log(e.gray(`   Capacity ID: ${r}`)), console.log(
      e.gray(`   Recipients can now express desire for this capacity
`)
    );
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("list-capacities").description("List all declared capacities (from network)").requiredOption("--did <did>", "Your DID (for storage access)").option("--provider <did>", "Filter by provider DID").action(async (o) => {
  try {
    const t = await (await l(o.did)).listCapacities(o.provider);
    if (t.length === 0) {
      console.log(e.yellow(`
⚠️  No capacities declared yet.
`));
      return;
    }
    console.log(e.blue(`
📦 Available Capacities:
`)), console.log(e.gray("─".repeat(70)));
    for (const r of t)
      console.log(e.white(`  ${r.capacityType}`)), console.log(e.gray(`  ID: ${r.id}`)), console.log(e.gray(`  Provider: ${r.providerDid}`)), console.log(e.gray(`  Quantity: ${r.totalQuantity} ${r.unit}`)), console.log(e.gray("─".repeat(70)));
    console.log();
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("express-desire").description("Express desire for a capacity (syncs to network)").requiredOption("--recipient-did <did>", "Recipient DID").requiredOption("--capacity-id <id>", "Capacity ID").requiredOption("--quantity <value>", "Desired quantity", parseFloat).action(async (o) => {
  try {
    const i = await l(o.recipientDid);
    if (!await i.getParticipant(o.recipientDid))
      throw new Error(`Recipient ${o.recipientDid} not found`);
    if (!await i.getCapacity(o.capacityId))
      throw new Error(`Capacity ${o.capacityId} not found`);
    console.log(e.blue(`
💭 Expressing desire:`)), console.log(e.gray(`   Recipient: ${o.recipientDid}`)), console.log(e.gray(`   Capacity: ${o.capacityId}`)), console.log(e.gray(`   Quantity: ${o.quantity}`)), i.addDesire(
      o.recipientDid,
      o.capacityId,
      o.quantity
    ), console.log(
      e.green(`
✅ Desire expressed successfully (syncing to network)`)
    ), console.log(
      e.gray(`   Use compute-allocation to calculate allocations
`)
    );
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("compute-allocation").description("Compute allocations for a capacity").requiredOption("--provider-did <did>", "Provider DID (for storage access)").requiredOption("--capacity-id <id>", "Capacity ID").option("--use-tee", "Use TEE simulation", !1).action(async (o) => {
  try {
    const i = await l(o.providerDid), t = await i.getCapacity(o.capacityId);
    if (!t)
      throw new Error(`Capacity ${o.capacityId} not found`);
    console.log(
      e.blue(`
⚙️  Computing allocation for capacity:`, t.id)
    ), console.log(e.gray(`   Provider: ${t.providerDid}`)), console.log(
      e.gray(`   Total: ${t.totalQuantity} ${t.unit}`)
    );
    const r = await i.getDesires(o.capacityId);
    if (console.log(e.blue(`
📊 Found ${r.length} desire(s)
`)), r.length === 0) {
      console.log(
        e.yellow(`⚠️  No desires expressed for this capacity.
`)
      );
      return;
    }
    const a = new I(3), s = {}, d = {};
    for (const n of r) {
      console.log(
        e.gray(`   Processing recipient: ${n.recipientDid}`)
      );
      const p = await i.getCommitment(
        t.providerDid,
        n.recipientDid
      ), f = await i.getCommitment(
        n.recipientDid,
        t.providerDid
      );
      if (!p || !f) {
        console.log(e.yellow("   ⚠️  Missing commitments, skipping..."));
        continue;
      }
      const D = 15;
      s[n.recipientDid] = a.secretShare(D, 3), d[n.recipientDid] = n.quantity;
    }
    console.log(e.blue(`
🔐 Running secure computation...
`));
    const m = a.computeNormalizedAllocation(
      s,
      t.totalQuantity,
      d
    );
    console.log(e.green(`✅ Allocation computed successfully!
`)), console.log(e.blue(`📊 Results:
`)), console.log(e.gray("─".repeat(70)));
    for (const [n, p] of Object.entries(m))
      console.log(e.white(`   Recipient: ${n}`)), console.log(
        e.green(`   Allocated: ${p.toFixed(2)} ${t.unit}`)
      ), console.log(e.gray("─".repeat(70))), i.addAllocation({
        capacityId: t.id,
        recipientDid: n,
        quantityAllocated: p,
        confirmed: !1
      });
    o.useTee && console.log(
      e.blue(`
🔐 TEE Attestation: RDX_Allocation_Enclave_v1`)
    ), console.log();
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.command("show-allocation").description("Show allocation for a capacity (from network)").requiredOption("--did <did>", "Your DID (for storage access)").requiredOption("--capacity-id <id>", "Capacity ID").action(async (o) => {
  try {
    const i = await l(o.did), t = await i.getCapacity(o.capacityId);
    if (!t)
      throw new Error(`Capacity ${o.capacityId} not found`);
    const r = await i.getAllocations(o.capacityId);
    if (r.length === 0) {
      console.log(e.yellow(`
⚠️  No allocations computed yet.
`));
      return;
    }
    console.log(e.blue(`
📊 Allocations:
`)), console.log(e.gray("─".repeat(70)));
    for (const a of r)
      console.log(e.white(`   Recipient: ${a.recipientDid}`)), console.log(
        e.green(
          `   Allocated: ${a.quantityAllocated} ${t.unit}`
        )
      ), console.log(
        e.gray(`   Confirmed: ${a.confirmed ? "Yes" : "No"}`)
      ), console.log(e.gray("─".repeat(70)));
    console.log();
  } catch (i) {
    console.error(e.red(`
❌ Error: ${i.message}
`)), process.exit(1);
  }
});
c.parse();
//# sourceMappingURL=rdx-cli.js.map
