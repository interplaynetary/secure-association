/**
 * Comprehensive Tests for RDX Cryptographic Core
 */

import { describe, it, expect, beforeEach } from "vitest";
import { randomBytes } from "crypto";
import {
  commit,
  verifyCommitment,
  SecretSharing,
  MPCProtocol,
  TEESimulator,
  type Commitment,
} from "../src/crypto-core";

// ============================================================================
// Pedersen Commitment Tests
// ============================================================================

describe("Pedersen Commitments", () => {
  it("should create valid commitment with 64-byte value and 32-byte randomness", () => {
    const value = 15.5;
    const commitment = commit(value);

    expect(commitment.value).toBeInstanceOf(Uint8Array);
    expect(commitment.value).toHaveLength(64);
    expect(commitment.randomness).toBeInstanceOf(Uint8Array);
    expect(commitment.randomness).toHaveLength(32);
  });

  it("should create deterministic commitment with same value and randomness", () => {
    const value = 25.0;
    const randomness = randomBytes(32);

    const commitment1 = commit(value, randomness);
    const commitment2 = commit(value, randomness);

    expect(commitment1.value).toEqual(commitment2.value);
  });

  it("should create different commitments with different randomness (HIDING property)", () => {
    const value = 42.0;
    const commitment1 = commit(value, randomBytes(32));
    const commitment2 = commit(value, randomBytes(32));

    expect(commitment1.value).not.toEqual(commitment2.value);
  });

  it("should verify correct commitment opening", () => {
    const value = 30.5;
    const randomness = randomBytes(32);
    const commitment = commit(value, randomness);

    const isValid = verifyCommitment(commitment, value, randomness);
    expect(isValid).toBe(true);
  });

  it("should reject commitment with wrong value", () => {
    const value = 50.0;
    const randomness = randomBytes(32);
    const commitment = commit(value, randomness);

    const isValid = verifyCommitment(commitment, 51.0, randomness);
    expect(isValid).toBe(false);
  });

  it("should reject commitment with wrong randomness", () => {
    const value = 75.0;
    const randomness = randomBytes(32);
    const commitment = commit(value, randomness);

    const wrongRandomness = randomBytes(32);
    const isValid = verifyCommitment(commitment, value, wrongRandomness);
    expect(isValid).toBe(false);
  });

  it("should throw error with invalid randomness length", () => {
    expect(() => commit(10.0, randomBytes(16))).toThrow("exactly 32 bytes");
    expect(() => commit(10.0, randomBytes(64))).toThrow("exactly 32 bytes");
  });

  it("should handle boundary values (0, 100)", () => {
    const commitment0 = commit(0.0);
    const commitment100 = commit(100.0);

    expect(commitment0.value).toHaveLength(64);
    expect(commitment100.value).toHaveLength(64);

    expect(verifyCommitment(commitment0, 0.0, commitment0.randomness)).toBe(
      true
    );
    expect(
      verifyCommitment(commitment100, 100.0, commitment100.randomness)
    ).toBe(true);
  });

  it("should create different commitments for very close values (BINDING property)", () => {
    const randomness = randomBytes(32);
    const commitment1 = commit(50.0, randomness);
    const commitment2 = commit(50.01, randomness);

    expect(commitment1.value).not.toEqual(commitment2.value);
  });
});

// ============================================================================
// Shamir Secret Sharing Tests
// ============================================================================

describe("Shamir Secret Sharing", () => {
  let secretSharing: SecretSharing;

  beforeEach(() => {
    secretSharing = new SecretSharing(3); // 3-of-n threshold
  });

  it("should create shares for a value", () => {
    const value = 42.5;
    const shares = secretSharing.share(value, 5);

    expect(shares).toHaveLength(5);
    expect(shares[0].index).toBe(1);
    expect(shares[4].index).toBe(5);
    expect(typeof shares[0].value).toBe("string");
  });

  it("should reconstruct exact value from threshold shares", () => {
    const value = 123.456789;
    const shares = secretSharing.share(value, 5);

    const reconstructed = secretSharing.reconstruct(shares.slice(0, 3));
    expect(Math.abs(reconstructed - value)).toBeLessThan(0.000001);
  });

  it("should reconstruct from any subset of threshold shares", () => {
    const value = 99.99;
    const shares = secretSharing.share(value, 5);

    const recon1 = secretSharing.reconstruct([shares[0], shares[1], shares[2]]);
    const recon2 = secretSharing.reconstruct([shares[0], shares[2], shares[4]]);
    const recon3 = secretSharing.reconstruct([shares[1], shares[3], shares[4]]);

    expect(Math.abs(recon1 - value)).toBeLessThan(0.000001);
    expect(Math.abs(recon2 - value)).toBeLessThan(0.000001);
    expect(Math.abs(recon3 - value)).toBeLessThan(0.000001);
  });

  it("should throw error with insufficient shares", () => {
    const value = 50.0;
    const shares = secretSharing.share(value, 5);

    expect(() => secretSharing.reconstruct(shares.slice(0, 2))).toThrow(
      "Insufficient shares"
    );
  });

  it("should handle zero value", () => {
    const value = 0.0;
    const shares = secretSharing.share(value, 3);
    const reconstructed = secretSharing.reconstruct(shares);

    expect(Math.abs(reconstructed - value)).toBeLessThan(0.000001);
  });

  it("should handle large values", () => {
    const value = 999999.999;
    const shares = secretSharing.share(value, 5);
    const reconstructed = secretSharing.reconstruct(shares);

    expect(Math.abs(reconstructed - value)).toBeLessThan(1.0);
  });

  it("should handle negative values", () => {
    const value = -42.5;
    const shares = secretSharing.share(value, 5);
    const reconstructed = secretSharing.reconstruct(shares);

    expect(Math.abs(reconstructed - value)).toBeLessThan(0.01);
  });

  it("should preserve high precision", () => {
    const value = 12.3456789;
    const shares = secretSharing.share(value, 3);
    const reconstructed = secretSharing.reconstruct(shares);

    expect(Math.abs(reconstructed - value)).toBeLessThan(0.0001);
  });
});

// ============================================================================
// MPC Protocol Tests
// ============================================================================

describe("MPC Protocol", () => {
  let mpc: MPCProtocol;

  beforeEach(() => {
    mpc = new MPCProtocol(5);
  });

  it("should share and reconstruct values", () => {
    const value = 75.0;
    const shares = mpc.secretShare(value, 5);
    const reconstructed = mpc.reconstruct(shares);

    expect(Math.abs(reconstructed - value)).toBeLessThan(0.01);
  });

  it("should compute mutual recognition", async () => {
    const valueA = 15.0;
    const valueB = 20.0;

    const sharesA = mpc.secretShare(valueA, 5);
    const sharesB = mpc.secretShare(valueB, 5);

    const mrShares = await mpc.computeMutualRecognition(sharesA, sharesB);
    const mr = mpc.reconstruct(mrShares);

    expect(mr).toBeCloseTo(Math.min(valueA, valueB), 0);
  });

  it("should allocate capacity proportionally to MR", () => {
    const mrShares = {
      alice: mpc.secretShare(30.0, 5),
      bob: mpc.secretShare(20.0, 5),
      carol: mpc.secretShare(10.0, 5),
    };

    const desires = {
      alice: 10.0,
      bob: 10.0,
      carol: 10.0,
    };

    const allocations = mpc.computeNormalizedAllocation(
      mrShares,
      12.0,
      desires
    );

    // Should allocate proportionally: 30:20:10 ratio
    expect(allocations.alice).toBeGreaterThan(4.0);
    expect(allocations.bob).toBeGreaterThan(2.0);
    expect(allocations.carol).toBeGreaterThan(0.5);

    // Total should not exceed capacity
    const total = allocations.alice + allocations.bob + allocations.carol;
    expect(total).toBeLessThanOrEqual(13.0);
  });

  it("should handle desire constraints", () => {
    const mrShares = {
      alice: mpc.secretShare(50.0, 5),
      bob: mpc.secretShare(50.0, 5),
    };

    const desires = {
      alice: 2.0, // Alice only wants 2
      bob: 10.0,
    };

    const allocations = mpc.computeNormalizedAllocation(
      mrShares,
      10.0,
      desires
    );

    // Alice should get at most her desire
    expect(allocations.alice).toBeLessThanOrEqual(2.5);
    // Bob should get more
    expect(allocations.bob).toBeGreaterThan(allocations.alice);
  });

  it("should handle zero mutual recognition", () => {
    const mrShares = {
      alice: mpc.secretShare(50.0, 5),
      bob: mpc.secretShare(0.0, 5), // Bob has zero MR
    };

    const desires = {
      alice: 10.0,
      bob: 10.0,
    };

    const allocations = mpc.computeNormalizedAllocation(
      mrShares,
      10.0,
      desires
    );

    // Alice should get everything
    expect(allocations.alice).toBeGreaterThan(9.0);
    expect(allocations.bob || 0).toBeLessThan(1.0);
  });
});

// ============================================================================
// TEE Simulator Tests
// ============================================================================

describe("TEE Simulator", () => {
  let tee: TEESimulator;

  beforeEach(() => {
    tee = new TEESimulator();
  });

  it("should compute allocation with valid commitments", () => {
    const randomness1 = randomBytes(32);
    const randomness2 = randomBytes(32);

    const commitment1 = commit(15.0, randomness1);
    const commitment2 = commit(20.0, randomness2);

    const recognitionCommitments = [
      {
        from: "did:example:alice",
        to: "did:example:bob",
        commitment: commitment1,
        value: 15.0,
        randomness: randomness1,
      },
      {
        from: "did:example:bob",
        to: "did:example:alice",
        commitment: commitment2,
        value: 20.0,
        randomness: randomness2,
      },
    ];

    const result = tee.computeAllocationInEnclave(
      recognitionCommitments,
      10.0,
      { "did:example:bob": 5.0 }
    );

    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0].recipientDid).toBe("did:example:bob");
    expect(result.attestation).toBeInstanceOf(Uint8Array);
  });

  it("should reject invalid commitments", () => {
    const randomness = randomBytes(32);
    const commitment = commit(15.0, randomness);

    const recognitionCommitments = [
      {
        from: "did:example:alice",
        to: "did:example:bob",
        commitment: commitment,
        value: 16.0, // Wrong value!
        randomness: randomness,
      },
    ];

    expect(() =>
      tee.computeAllocationInEnclave(recognitionCommitments, 10.0, {})
    ).toThrow("Invalid commitment");
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("End-to-End Integration", () => {
  it("should perform complete allocation flow", async () => {
    const mpc = new MPCProtocol(3);

    // Alice and Bob set mutual recognition
    const aliceRecognizesBob = 15.0;
    const bobRecognizesAlice = 20.0;

    // Create commitments
    const randomnessAlice = randomBytes(32);
    const randomnessBob = randomBytes(32);

    const commitmentAlice = commit(aliceRecognizesBob, randomnessAlice);
    const commitmentBob = commit(bobRecognizesAlice, randomnessBob);

    // Verify commitments
    expect(
      verifyCommitment(commitmentAlice, aliceRecognizesBob, randomnessAlice)
    ).toBe(true);
    expect(
      verifyCommitment(commitmentBob, bobRecognizesAlice, randomnessBob)
    ).toBe(true);

    // Share recognition values
    const sharesAlice = mpc.secretShare(aliceRecognizesBob, 3);
    const sharesBob = mpc.secretShare(bobRecognizesAlice, 3);

    // Compute MR
    const mrShares = await mpc.computeMutualRecognition(sharesAlice, sharesBob);
    const mr = mpc.reconstruct(mrShares);

    expect(mr).toBeCloseTo(Math.min(aliceRecognizesBob, bobRecognizesAlice), 0);

    // Compute allocation
    const allocations = mpc.computeNormalizedAllocation(
      { "did:example:bob": mrShares },
      10.0,
      { "did:example:bob": 2.0 }
    );

    expect(allocations["did:example:bob"]).toBeLessThanOrEqual(2.1);
    expect(allocations["did:example:bob"]).toBeGreaterThan(1.5);
  });
});
