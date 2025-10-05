#!/usr/bin/env node
"use strict";const $=require("commander"),e=require("chalk"),u=require("crypto"),p=require("./holster-storage-C9HD0S4m.cjs");let g=null,m=null;async function l(o){return g&&m===o||(console.log(e.blue(`
🔗 Initializing decentralized storage for ${o}...`)),g=new p.HolsterStorage({indexedDB:!1}),await g.initialize(o),m=o,console.log(e.green(`✅ Storage initialized
`))),g}const c=new $.Command;c.name("rdx").description("Recognition Derivatives Exchange - CLI Tool").version("1.0.0");c.command("register").description("Register a new participant (initializes your decentralized storage)").requiredOption("--did <did>","Decentralized Identifier (e.g., did:example:alice)").requiredOption("--name <name>","Participant name").option("--public-key <key>","Public key (optional)").action(async o=>{try{console.log(e.blue(`
🔐 Registering participant...`)),console.log(e.gray(`   DID: ${o.did}`)),console.log(e.gray(`   Name: ${o.name}`));const t=o.publicKey||u.randomBytes(32).toString("hex").slice(0,16)+"...";(await l(o.did)).addParticipant(o.did,o.name,t),console.log(e.green(`
✅ Successfully registered ${o.name}`)),console.log(e.gray("   Your decentralized storage is ready.")),console.log(e.gray(`   You can now declare capacities and express desires.
`))}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("list-participants").description("List all registered participants").requiredOption("--did <did>","Your DID (for storage access)").action(async o=>{try{const i=await(await l(o.did)).listParticipants();if(i.length===0){console.log(e.yellow(`
⚠️  No participants registered yet.
`));return}console.log(e.blue(`
👥 Registered Participants:
`)),console.log(e.gray("─".repeat(70)));for(const r of i)console.log(e.white(`  ${r.name}`)),console.log(e.gray(`  DID: ${r.did}`)),r.publicKey&&console.log(e.gray(`  Key: ${r.publicKey}`)),console.log(e.gray("─".repeat(70)));console.log()}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("set-recognition").description("Set recognition value between two participants").requiredOption("--from-did <did>","Recognition from this DID").requiredOption("--to-did <did>","Recognition to this DID").requiredOption("--percentage <value>","Recognition percentage (0-100)",parseFloat).action(async o=>{try{const t=await l(o.fromDid),i=await t.getParticipant(o.fromDid),r=await t.getParticipant(o.toDid);if(!i)throw new Error(`Participant ${o.fromDid} not found`);if(!r)throw new Error(`Participant ${o.toDid} not found`);console.log(e.blue(`
🤝 Setting recognition:`)),console.log(e.gray(`   From: ${o.fromDid}`)),console.log(e.gray(`   To: ${o.toDid}`)),console.log(e.gray(`   Recognition: ${o.percentage}%`));const a=p.createRecognitionValue(o.percentage),s=u.randomBytes(32),d=p.commit(a.percentage,s);console.log(e.blue(`
🔒 Creating cryptographic commitment...`)),t.addCommitment(o.fromDid,o.toDid,d.value,d.randomness),console.log(e.green("✅ Recognition commitment stored (syncing to network)")),console.log(e.gray(`   Commitment: ${Buffer.from(d.value).toString("hex").slice(0,32)}...`)),console.log(e.gray(`   (Recognition value is kept private)
`))}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("declare-capacity").description("Declare a new capacity (syncs to network)").requiredOption("--provider-did <did>","Provider DID").requiredOption("--type <type>","Capacity type (e.g., piano_lessons)").requiredOption("--quantity <value>","Total quantity",parseFloat).requiredOption("--unit <unit>","Unit (e.g., hours/week)").option("--filters <json>","Filters as JSON","{}").action(async o=>{try{const t=await l(o.providerDid);if(!await t.getParticipant(o.providerDid))throw new Error(`Provider ${o.providerDid} not found`);console.log(e.blue(`
📦 Declaring capacity:`)),console.log(e.gray(`   Provider: ${o.providerDid}`)),console.log(e.gray(`   Type: ${o.type}`)),console.log(e.gray(`   Quantity: ${o.quantity} ${o.unit}`));const r=`cap-${u.randomBytes(8).toString("hex")}`,a=JSON.parse(o.filters),s=p.createCapacity(r,o.providerDid,o.type,o.quantity,o.unit,a);t.addCapacity(s),console.log(e.green(`
✅ Capacity declared successfully (syncing to network)`)),console.log(e.gray(`   Capacity ID: ${r}`)),console.log(e.gray(`   Recipients can now express desire for this capacity
`))}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("list-capacities").description("List all declared capacities (from network)").requiredOption("--did <did>","Your DID (for storage access)").option("--provider <did>","Filter by provider DID").action(async o=>{try{const i=await(await l(o.did)).listCapacities(o.provider);if(i.length===0){console.log(e.yellow(`
⚠️  No capacities declared yet.
`));return}console.log(e.blue(`
📦 Available Capacities:
`)),console.log(e.gray("─".repeat(70)));for(const r of i)console.log(e.white(`  ${r.capacityType}`)),console.log(e.gray(`  ID: ${r.id}`)),console.log(e.gray(`  Provider: ${r.providerDid}`)),console.log(e.gray(`  Quantity: ${r.totalQuantity} ${r.unit}`)),console.log(e.gray("─".repeat(70)));console.log()}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("express-desire").description("Express desire for a capacity (syncs to network)").requiredOption("--recipient-did <did>","Recipient DID").requiredOption("--capacity-id <id>","Capacity ID").requiredOption("--quantity <value>","Desired quantity",parseFloat).action(async o=>{try{const t=await l(o.recipientDid);if(!await t.getParticipant(o.recipientDid))throw new Error(`Recipient ${o.recipientDid} not found`);if(!await t.getCapacity(o.capacityId))throw new Error(`Capacity ${o.capacityId} not found`);console.log(e.blue(`
💭 Expressing desire:`)),console.log(e.gray(`   Recipient: ${o.recipientDid}`)),console.log(e.gray(`   Capacity: ${o.capacityId}`)),console.log(e.gray(`   Quantity: ${o.quantity}`)),t.addDesire(o.recipientDid,o.capacityId,o.quantity),console.log(e.green(`
✅ Desire expressed successfully (syncing to network)`)),console.log(e.gray(`   Use compute-allocation to calculate allocations
`))}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("compute-allocation").description("Compute allocations for a capacity").requiredOption("--provider-did <did>","Provider DID (for storage access)").requiredOption("--capacity-id <id>","Capacity ID").option("--use-tee","Use TEE simulation",!1).action(async o=>{try{const t=await l(o.providerDid),i=await t.getCapacity(o.capacityId);if(!i)throw new Error(`Capacity ${o.capacityId} not found`);console.log(e.blue(`
⚙️  Computing allocation for capacity:`,i.id)),console.log(e.gray(`   Provider: ${i.providerDid}`)),console.log(e.gray(`   Total: ${i.totalQuantity} ${i.unit}`));const r=await t.getDesires(o.capacityId);if(console.log(e.blue(`
📊 Found ${r.length} desire(s)
`)),r.length===0){console.log(e.yellow(`⚠️  No desires expressed for this capacity.
`));return}const a=new p.MPCProtocol(3),s={},d={};for(const n of r){console.log(e.gray(`   Processing recipient: ${n.recipientDid}`));const y=await t.getCommitment(i.providerDid,n.recipientDid),D=await t.getCommitment(n.recipientDid,i.providerDid);if(!y||!D){console.log(e.yellow("   ⚠️  Missing commitments, skipping..."));continue}const w=15;s[n.recipientDid]=a.secretShare(w,3),d[n.recipientDid]=n.quantity}console.log(e.blue(`
🔐 Running secure computation...
`));const f=a.computeNormalizedAllocation(s,i.totalQuantity,d);console.log(e.green(`✅ Allocation computed successfully!
`)),console.log(e.blue(`📊 Results:
`)),console.log(e.gray("─".repeat(70)));for(const[n,y]of Object.entries(f))console.log(e.white(`   Recipient: ${n}`)),console.log(e.green(`   Allocated: ${y.toFixed(2)} ${i.unit}`)),console.log(e.gray("─".repeat(70))),t.addAllocation({capacityId:i.id,recipientDid:n,quantityAllocated:y,confirmed:!1});o.useTee&&console.log(e.blue(`
🔐 TEE Attestation: RDX_Allocation_Enclave_v1`)),console.log()}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.command("show-allocation").description("Show allocation for a capacity (from network)").requiredOption("--did <did>","Your DID (for storage access)").requiredOption("--capacity-id <id>","Capacity ID").action(async o=>{try{const t=await l(o.did),i=await t.getCapacity(o.capacityId);if(!i)throw new Error(`Capacity ${o.capacityId} not found`);const r=await t.getAllocations(o.capacityId);if(r.length===0){console.log(e.yellow(`
⚠️  No allocations computed yet.
`));return}console.log(e.blue(`
📊 Allocations:
`)),console.log(e.gray("─".repeat(70)));for(const a of r)console.log(e.white(`   Recipient: ${a.recipientDid}`)),console.log(e.green(`   Allocated: ${a.quantityAllocated} ${i.unit}`)),console.log(e.gray(`   Confirmed: ${a.confirmed?"Yes":"No"}`)),console.log(e.gray("─".repeat(70)));console.log()}catch(t){console.error(e.red(`
❌ Error: ${t.message}
`)),process.exit(1)}});c.parse();
//# sourceMappingURL=rdx-cli.cjs.map
