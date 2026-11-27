import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

interface Common {
  icon?: ReactNode
  children?: ReactNode
  tint?: 'default' | 'accent'
  className?: string
}

type ButtonProps = Common & { as?: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>
type AnchorProps = Common & { as: 'a' } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common>

export type GlassButtonProps = ButtonProps | AnchorProps

/** Root class for anything wearing the glass button face (e.g. a router Link). */
export function glassClass(tint: Common['tint'] = 'default', className = ''): string {
  return `glass-btn-root ${tint === 'accent' ? 'glass-tint-accent' : ''} ${className}`.trim()
}

/** The glass layers; put inside an element with `glassClass()`. */
export function GlassFace({ icon, children }: { icon?: ReactNode; children?: ReactNode }) {
  return (
    <>
      <span className="glass-surface" aria-hidden="true" />
      <span className="glass-content">
        {icon}
        {children}
      </span>
      <span className="glass-shadow" aria-hidden="true" />
    </>
  )
}

export default function GlassButton(props: GlassButtonProps) {
  const { icon, children, tint = 'default', className = '' } = props
  const cls = glassClass(tint, className)
  const inner = <GlassFace icon={icon}>{children}</GlassFace>

  if (props.as === 'a') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as, icon: _i, children: _c, tint: _t, className: _cn, ...rest } = props
    return (
      <a {...rest} className={cls}>
        {inner}
      </a>
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, icon: _i, children: _c, tint: _t, className: _cn, type = 'button', ...rest } = props
  return (
    <button {...rest} type={type} className={cls}>
      {inner}
    </button>
  )
}
