/**
 * Garbled Circuits Implementation (Yao's Protocol)
 * Secure Two-Party Computation for Boolean Circuits
 *
 * This implements secure minimum computation using garbled circuits.
 */
export declare class WireLabel {
    readonly value: Uint8Array;
    constructor(value: Uint8Array);
    static random(): WireLabel;
    equals(other: WireLabel): boolean;
}
export type GateType = "AND" | "OR" | "XOR" | "NOT";
export interface Gate {
    type: GateType;
    inputs: number[];
    output: number;
}
export interface GarbledGate {
    gateId: number;
    encryptedTable: Uint8Array[];
}
export interface GarbledCircuit {
    gates: GarbledGate[];
    wireLabels: Map<number, [WireLabel, WireLabel]>;
    outputWires: number[];
}
export declare class Garbler {
    private wireLabels;
    private nextWireId;
    /**
     * Create a new wire with random labels for 0 and 1
     */
    createWire(): number;
    /**
     * Get wire labels
     */
    getWireLabels(wireId: number): [WireLabel, WireLabel];
    /**
     * Garble a gate using encryption
     */
    garbleGate(gate: Gate): GarbledGate;
    /**
     * Encrypt a label using input labels as keys
     */
    private encrypt;
    private permuteTable;
    private getTruthTable;
}
export declare class Evaluator {
    /**
     * Evaluate a garbled gate given input labels
     */
    evaluateGate(garbledGate: GarbledGate, inputLabel1: WireLabel, inputLabel2: WireLabel): WireLabel;
    private decrypt;
    private evaluateXOR;
}
/**
 * Build a circuit for computing min(a, b) where a, b are 32-bit integers
 */
export declare class SecureMinCircuit {
    private readonly bitWidth;
    private garbler;
    constructor(bitWidth?: number);
    /**
     * Build and garble the minimum circuit
     */
    buildCircuit(a: number, b: number): {
        result: number;
        garbledCircuit: GarbledCircuit;
    };
    private numberToBits;
    private buildComparator;
    private buildMultiplexer;
}
/**
 * Compute minimum of two values using garbled circuits
 */
export declare function secureMinimumGarbled(a: number, b: number): Promise<number>;
//# sourceMappingURL=garbled-circuits.d.ts.map