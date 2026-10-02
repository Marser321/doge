import Image from 'next/image'

/**
 * The DOGE bull, cropped out of the full lockup.
 *
 * The source asset is a vertical lockup — bull above the word "DOGE" — and it
 * was being dropped into 36–64px squares in nine places. At that size the
 * wordmark is illegible, and it duplicates the "DOGE.S.M LLC" text that
 * already sits beside it. So the mark shows the bull only; the wordmark stays
 * as real text wherever it is needed.
 *
 * The maroon also measures 1.73:1 against the page background, below the 3:1
 * WCAG minimum for graphics, which is why it read as a dark smudge. `lift`
 * raises its luminance for dark surfaces; on light surfaces the original
 * colour already has the contrast it needs.
 */

/** Vertical slice of the source image occupied by the bull. */
const BULL_TOP = 0.08
const BULL_BOTTOM = 0.70
const SCALE = 1 / (BULL_BOTTOM - BULL_TOP)

const SIZES = { sm: 28, md: 36, lg: 48, xl: 64 } as const

export type BrandMarkSize = keyof typeof SIZES

type Props = {
  size?: BrandMarkSize
  /** Raise the red for dark surfaces. Off for light backgrounds and print. */
  lift?: boolean
  /** Soft halo so the mark separates from the surface behind it. */
  glow?: boolean
  className?: string
  priority?: boolean
}

export function BrandMark({
  size = 'md',
  lift = true,
  glow = true,
  className = '',
  priority = false,
}: Props) {
  const px = SIZES[size]
  const rendered = Math.round(px * SCALE)

  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 overflow-hidden ${glow ? 'brand-glow' : ''} ${className}`}
      style={{ width: px, height: px }}
    >
      <Image
        src="/doge-logo-transparent.png"
        alt=""
        width={rendered}
        height={rendered}
        priority={priority}
        sizes={`${rendered}px`}
        className="absolute left-1/2 max-w-none -translate-x-1/2"
        style={{
          top: -Math.round(rendered * BULL_TOP),
          filter: lift ? 'brightness(1.85) saturate(0.95)' : undefined,
        }}
      />
    </span>
  )
}
