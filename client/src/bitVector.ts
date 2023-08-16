export type BitValue = 0 | 1

export default class BitVector extends DataView {
    biggestSetIndex = 0
    bitSize = 8

    constructor(lengthInBytes: number) {
        super(new ArrayBuffer(lengthInBytes))
    }

    private getByteOffsetFromIndex(index: number) {
        return Math.floor(index / this.bitSize)
    }

    private getBitOffsetFromIndex(index: number) {
        return index & this.bitSize - 1 // same as index % bitSize but more performant
    }

    /**
     * Reads the bit at given index.
     * @param index
     */
    getBit(index: number): BitValue {
        const bitMask = 1 << this.bitSize - this.getBitOffsetFromIndex(index) - 1

        return (this.getUint8(this.getByteOffsetFromIndex(index)) & bitMask) === 0 ? 0 : 1
    }

    setBit(index: number, value: BitValue) {
        const bitMask = 1 << this.bitSize - this.getBitOffsetFromIndex(index) - 1
        const byteOffset = this.getByteOffsetFromIndex(index)
        const bitField = value === 1 ? this.getUint8(byteOffset) | bitMask : this.getUint8(byteOffset) & ~bitMask

        this.setUint8(byteOffset, bitField)

        if (index > this.biggestSetIndex) this.biggestSetIndex = index
    }

    slice(start = 0, end = this.byteLength * 8) {
        const bitVector = new BitVector(Math.ceil((end - start) / 8))

        for (let i = start; i < end; i++) {
            bitVector.setBit(i - start, this.getBit(i))
        }

        return bitVector
    }

    toString(): string {
        let string = ''

        for (let i = 0; i < this.byteLength; i++) {
            for (let j = 0; j < this.bitSize; j++) {
                string += this.getBit(i * this.bitSize + j).toString()
            }
        }

        return string
    }
}