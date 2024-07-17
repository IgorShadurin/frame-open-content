import Memcached from 'memcached'
import util from 'util'

export const memcached = new Memcached(process.env.MEMCACHED_URL || 'localhost:11211')
const NAMESPACE = 'open_content'
const SESSION_KEY = 'open_session'
const SESSION_KEY_EXPIRATION_SECONDS = 60 * 10 // 10 minutes
const UUIDV4_LENGTH = 36

const memcachedGet = util.promisify(memcached.get).bind(memcached)
const memcachedSet = util.promisify(memcached.set).bind(memcached)
const memcachedDel = util.promisify(memcached.del).bind(memcached)
const memcachedFlush = util.promisify(memcached.flush).bind(memcached)

/**
 * Get key for Memcached
 * @param params Key parts
 */
export function getKey(...params: string[]): string {
  return [NAMESPACE, ...params].join(':')
}

/**
 * Remove all data from Memcached
 */
export async function removeAll(): Promise<boolean[]> {
  return memcachedFlush()
}

export function checkSessionLength(sessionId: string): void {
  if (sessionId.length !== UUIDV4_LENGTH) {
    throw new Error(`Invalid session ID length. Expected ${UUIDV4_LENGTH} characters.`)
  }
}

export async function setSessionInfo(sessionId: string, fid: number): Promise<void> {
  checkSessionLength(sessionId)
  await memcachedSet(getKey(SESSION_KEY, sessionId), fid.toString(), SESSION_KEY_EXPIRATION_SECONDS)
  await memcachedSet(getKey(SESSION_KEY, fid.toString()), sessionId, SESSION_KEY_EXPIRATION_SECONDS)
}

export async function removeSessionInfo(sessionId: string): Promise<void> {
  checkSessionLength(sessionId)
  const fid = await memcachedGet(getKey(SESSION_KEY, sessionId))

  if (fid !== undefined) {
    await memcachedDel(getKey(SESSION_KEY, sessionId))
    await memcachedDel(getKey(SESSION_KEY, fid))
  }
}

export async function getSessionInfo(sessionId: string): Promise<number> {
  checkSessionLength(sessionId)
  const result = await memcachedGet(getKey(SESSION_KEY, sessionId))

  if (result !== undefined) {
    return Number(result)
  }

  throw new Error('Session not found')
}
