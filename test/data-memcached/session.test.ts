import { getSessionInfo, memcached, removeAll, setSessionInfo } from '../../src/utils/clicks'
import { v4 as uuidv4 } from 'uuid'

describe('Session', () => {
  beforeEach(async () => {
    await removeAll()
  })

  afterAll(async () => {
    memcached.end()
  })

  it('should register the session', async () => {
    const fid = 123456
    const sessionId = uuidv4()
    await setSessionInfo(sessionId, fid)
    expect(await getSessionInfo(sessionId)).toEqual(fid)
  })

  it('should return null for non-existent session', async () => {
    const sessionId = uuidv4()
    expect(async () => getSessionInfo(sessionId)).rejects.toThrowError('Session not found')
  })

  it('should not set session with invalid UUID length', async () => {
    const fid = 123456
    const invalidSessionId = '1234' // Invalid length

    expect(async () => setSessionInfo(invalidSessionId, fid)).rejects.toThrowError(
      'Invalid session ID length. Expected 36 characters.',
    )

    expect(async () => getSessionInfo(invalidSessionId)).rejects.toThrowError(
      'Invalid session ID length. Expected 36 characters.',
    )
  })

  it('should overwrite existing session', async () => {
    const fid1 = 123456
    const fid2 = 654321
    const sessionId = uuidv4()
    await setSessionInfo(sessionId, fid1)
    expect(await getSessionInfo(sessionId)).toEqual(fid1)
    await setSessionInfo(sessionId, fid2)
    expect(await getSessionInfo(sessionId)).toEqual(fid2)
  })

  it('should handle concurrent session registrations', async () => {
    const sessionId = uuidv4()
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(setSessionInfo(sessionId, i))
    }
    await Promise.all(promises)
    // The session info should be one of the values set
    const sessionInfo = await getSessionInfo(sessionId)
    expect(sessionInfo).toBeGreaterThanOrEqual(0)
    expect(sessionInfo).toBeLessThan(10)
  })

  it('should handle multiple different sessions', async () => {
    const sessions = Array.from({ length: 10 }, () => ({
      fid: Math.floor(Math.random() * 1000000),
      sessionId: uuidv4(),
    }))

    for (const { sessionId, fid } of sessions) {
      await setSessionInfo(sessionId, fid)
    }

    for (const { sessionId, fid } of sessions) {
      expect(await getSessionInfo(sessionId)).toEqual(fid)
    }
  })

  it('should not set session if sessionId is empty', async () => {
    const fid = 123456
    const emptySessionId = ''
    expect(async () => setSessionInfo(emptySessionId, fid)).rejects.toThrowError(
      'Invalid session ID length. Expected 36 characters.',
    )
  })
})
