import { Request, Response, NextFunction } from 'express'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // https://warpcast.notion.site/Draft-Composer-Actions-7f2b8739ee8447cc8a6b518c234b1eeb
    res.json({
      type: 'composer',
      name: 'Data for Sale',
      icon: 'unlock',
      description: 'Sell data for USDC',
      // aboutUrl: 'https://warpcast.com/dappykit/0x74ecfb66',
      imageUrl: 'https://open.web4.build/100.png',
      action: { type: 'post' },
    })
  } catch (e) {
    next(e)
  }
}
