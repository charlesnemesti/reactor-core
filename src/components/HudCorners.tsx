export function HudCorners() {
  return (
    <div className="hud-corners pointer-events-none fixed inset-0 z-[5]" aria-hidden>
      <span className="hud-corner hud-corner--tl" />
      <span className="hud-corner hud-corner--tr" />
      <span className="hud-corner hud-corner--bl" />
      <span className="hud-corner hud-corner--br" />
    </div>
  )
}
