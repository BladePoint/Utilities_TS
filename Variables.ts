export class Variables {
    private object: Record<string, number>;
    constructor() {
        this.object = {};
    }
    getVar(property: string): number {
        return this.object[property] || 0;
    }
    setVar(property: string, value: number): void {
        this.object[property] = value;
    }
    incVar(property: string, amount: number = 1): void {
        this.setVar(property, this.getVar(property) + amount);
    }
    decVar(property: string, amount: number = 1): void {
        this.incVar(property, -amount);
    }
    reset(): void {
        this.object = {};
    }
}
