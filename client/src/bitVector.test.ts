import BitVector from './bitVector'

const bitVector = new BitVector(1)

test('test set', () => {
    bitVector.setBit(1,1)
    expect(bitVector.toString()).toBe('01000000')
})

test('test splice', () => {
    expect(bitVector.slice(1).toString()).toBe('10000000')
})
