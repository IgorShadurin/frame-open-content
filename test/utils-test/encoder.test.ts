import { decodeAmount, encodeAmount, decodeBase, encodeBase } from '../../src/utils/encoder'

describe('Encoder', () => {
  const correctItems = [
    {
      amount: 99.01,
      itemId: 1,
      userId: 2,
      expected: '99.010000010000002',
    },
    {
      amount: 1,
      itemId: 20000,
      userId: 3000000,
      expected: '1.000200003',
    },
    {
      amount: 1,
      itemId: 20,
      userId: 30,
      expected: '1.00000020000003',
    },
    {
      amount: 1,
      itemId: 2,
      userId: 3,
      expected: '1.000000020000003',
    },
    {
      amount: 0.01,
      itemId: 1,
      userId: 1,
      expected: '0.010000010000001',
    },
    {
      amount: 1.11,
      itemId: 99999,
      userId: 1111111,
      expected: '1.110999991111111',
    },
    {
      amount: 0.01,
      itemId: 1,
      userId: 1,
      expected: '0.010000010000001',
    },
    {
      amount: 99.99,
      itemId: 99999,
      userId: 9999999,
      expected: '99.990999999999999',
    },
    {
      amount: 10.0,
      itemId: 123,
      userId: 4567,
      expected: '10.000001230004567',
    },
    {
      amount: 10.1,
      itemId: 10001,
      userId: 1000001,
      expected: '10.100100011000001',
    },
    {
      amount: 99.99,
      itemId: 10000,
      userId: 1000000,
      expected: '99.990100001',
    },
  ]

  const correctBaseItems = [
    {
      amount: 99.1,
      invoiceId: 1,
      expected: '99.100001',
    },
    {
      amount: 1,
      invoiceId: 20000,
      expected: '1.02',
    },
    {
      amount: 10.1,
      invoiceId: 12345,
      expected: '10.112345',
    },
    {
      amount: 0.1,
      invoiceId: 1,
      expected: '0.100001',
    },
  ]

  const incorrectItemsForEncode = [
    {
      amount: 0.001,
      itemId: 1,
      userId: 1,
    },
    {
      amount: 100,
      itemId: 1,
      userId: 1,
    },
    {
      amount: 10.001,
      itemId: 1,
      userId: 1,
    },
    {
      amount: 10,
      itemId: 0,
      userId: 1,
    },
    {
      amount: 10,
      itemId: 100000,
      userId: 1,
    },
    {
      amount: 10,
      itemId: 10.5,
      userId: 1,
    },
    {
      amount: 10,
      itemId: 1,
      userId: 0,
    },
    {
      amount: 10,
      itemId: 1,
      userId: 10000000,
    },
    {
      amount: 10,
      itemId: 1,
      userId: 1.5,
    },
  ]

  const incorrectItemsForBaseEncode = [
    {
      amount: 0.01,
      invoiceId: 1,
    },
    {
      amount: 1000,
      invoiceId: 1,
    },
    {
      amount: 10.001,
      invoiceId: 1,
    },
    {
      amount: 10,
      invoiceId: 0,
    },
    {
      amount: 10,
      invoiceId: 100000,
    },
    {
      amount: 10,
      invoiceId: 10.5,
    },
  ]

  const incorrectItemsForDecode = ['10.1001000110000010', '1.0000000020000003', '1.00100002000']

  const incorrectItemsForBaseDecode = ['10.100123450', '1.000200000', '0.10000001a']

  it('should encode all cases', () => {
    correctItems.forEach(item => {
      expect(encodeAmount(item.amount, item.itemId, item.userId)).toBe(item.expected)
    })
  })

  it('should decode all cases', () => {
    correctItems.forEach(item => {
      const decoded = decodeAmount(item.expected)
      expect(decoded.amount).toBe(item.amount)
      expect(decoded.itemId).toBe(item.itemId)
      expect(decoded.userId).toBe(item.userId)
    })
  })

  it('should encode base cases', () => {
    correctBaseItems.forEach(item => {
      expect(encodeBase(item.amount, item.invoiceId)).toBe(item.expected)
    })
  })

  it('should decode base cases', () => {
    correctBaseItems.forEach(item => {
      const decoded = decodeBase(item.expected)
      expect(decoded.amount).toBe(item.amount)
      expect(decoded.invoiceId).toBe(item.invoiceId)
    })
  })

  it('should throw an error for invalid encode cases', () => {
    incorrectItemsForEncode.forEach(item => {
      expect(() => encodeAmount(item.amount, item.itemId, item.userId)).toThrow()
    })
  })

  it('should throw an error for invalid base encode cases', () => {
    incorrectItemsForBaseEncode.forEach(item => {
      expect(() => encodeBase(item.amount, item.invoiceId)).toThrow()
    })
  })

  it('should throw an error for invalid decode cases', () => {
    incorrectItemsForDecode.forEach(encoded => {
      expect(() => decodeAmount(encoded)).toThrow()
    })
  })

  it('should throw an error for invalid base decode cases', () => {
    incorrectItemsForBaseDecode.forEach(encoded => {
      expect(() => decodeBase(encoded)).toThrow()
    })
  })
})
