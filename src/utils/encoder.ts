/**
 * Encodes the given amount, itemId, and userId into a formatted string.
 * @param {number} amount - The amount to encode.
 * @param {number} itemId - The item ID to encode.
 * @param {number} userId - The user ID to encode.
 * @returns {string} - The encoded string.
 * @throws {Error} - If any of the inputs are invalid.
 */
export function encodeAmount(amount: number, itemId: number, userId: number): string {
  if (amount < 0.01 || amount > 99.99 || amount.toString().split('.')[1]?.length > 2) {
    throw new Error('Invalid amount')
  }

  if (itemId < 1 || itemId > 99999 || !Number.isInteger(itemId)) {
    throw new Error('Invalid itemId')
  }

  if (userId < 1 || userId > 9999999 || !Number.isInteger(userId)) {
    throw new Error('Invalid userId')
  }

  const formattedAmount = amount.toFixed(2)
  const formattedItemId = itemId.toString().padStart(5, '0')
  const formattedUserId = userId.toString().padStart(7, '0')

  return `${formattedAmount}0${formattedItemId}${formattedUserId}`.replace(/0+$/, '')
}

/**
 * Decodes the given encoded string into the original amount, itemId, and userId.
 * @param {string} encoded - The encoded string.
 * @returns {{ amount: number, itemId: number, userId: number }} - The decoded values.
 * @throws {Error} - If the encoded string is invalid.
 */
export function decodeAmount(encoded: string): { amount: number; itemId: number; userId: number } {
  const dotIndex = encoded.indexOf('.')

  if (dotIndex === -1) {
    throw new Error('Invalid encoded string')
  }

  if (encoded[dotIndex + 3] !== '0') {
    throw new Error('Zero delimiter missing')
  }

  const numberLength = encoded.replace('.', '').length

  if (numberLength > 18) {
    throw new Error(`Invalid string length. Received: ${numberLength}`)
  }

  const amount = parseFloat(encoded.slice(0, dotIndex + 3))
  const remaining = encoded.slice(dotIndex + 4)

  const itemId = parseInt(remaining.slice(0, 5), 10)
  const userId = parseInt(remaining.slice(5).padEnd(7, '0'), 10)

  if (isNaN(amount) || isNaN(itemId) || isNaN(userId)) {
    throw new Error('NaN result value')
  }

  if (amount < 0.01 || amount > 99.99) {
    throw new Error('Invalid result amount')
  }

  if (itemId < 1 || itemId > 99999) {
    throw new Error('Invalid result itemId')
  }

  if (userId < 1 || userId > 9999999) {
    throw new Error('Invalid result userId')
  }

  return { amount, itemId, userId }
}
