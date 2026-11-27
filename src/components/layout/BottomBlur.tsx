/** Progressive bottom blur (mobile only). Sits below the dock (z-40 vs the dock's z-60). */
export default function BottomBlur() {
  return (
    <div aria-hidden="true" className="bottom-gradient-blur lg:hidden">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}
