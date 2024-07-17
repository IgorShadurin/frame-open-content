/**
 * https://warpcast.notion.site/Draft-Composer-Actions-7f2b8739ee8447cc8a6b518c234b1eeb
 */
export interface UntrustedData {
  fid: number
  url: string
  messageHash: string
  timestamp: number
  network: number
  buttonIndex: number // Always 1
  state: string
  castId?: {
    fid: number
    hash: string
  }
}

export interface TrustedData {
  messageBytes: string
}

export interface IComposerAction {
  untrustedData: UntrustedData
  trustedData: TrustedData
}

export interface ActionCast {
  text: string
  embeds: unknown[]
  castDistribution: string
}

export interface ActionState {
  requestId: string
  cast: ActionCast
}

export type ComposerActionFormResponse = {
  type: 'form' // Must be "form"
  title: string // e.g. "Create Poll," "Create Event," "New Bounty"
  url: string // Form URL to embed in client
}

export function isComposerAction(action: IComposerAction): boolean {
  if (!action.untrustedData || !action.trustedData) {
    return false
  }

  const { fid, url, messageHash, timestamp, network, buttonIndex, state, castId } = action.untrustedData

  // const { fid: castFid, hash: castHash } = castId

  const { messageBytes } = action.trustedData

  return (
    fid !== undefined &&
    url !== undefined &&
    messageHash !== undefined &&
    timestamp !== undefined &&
    network !== undefined &&
    buttonIndex !== undefined &&
    state !== undefined &&
    // castFid !== undefined &&
    // castHash !== undefined &&
    messageBytes !== undefined
  )
}
