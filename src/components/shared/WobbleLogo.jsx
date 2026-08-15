import React from 'react';

/**
 * Wobble Date mark, drawn as vector so it stays crisp and is animatable.
 *
 * Geometry:
 *   - The coral "W" runs from (49,66) down/up/down/up to (152,66)
 *   - The male glyph sits on the LEFT end of the W
 *   - The female glyph sits on the RIGHT end of the W
 *   - Visual centre of the whole mark is roughly (100, 95) in viewBox units
 */
const WobbleLogo = ({ className = '', animated = false, ...rest }) => (
  <svg
    className={`wobble-logo ${animated ? 'is-animated' : ''} ${className}`.trim()}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Wobble Date"
    {...rest}
  >
    {/* --- The W --- */}
    <path
      className="wl-w"
      d="M49 66 L79 144 L106 89 L131 144 L152 66"
      fill="none"
      stroke="#FF8A65"
      strokeWidth="30"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="100"
    />

    {/* --- Male glyph: left arm of the W ---
        outer group orbits the mark centre, inner group pops in on its own centre */}
    <g className="wl-male-orbit">
    <g className="wl-male">
      <path
        d="M46 62 L21 36"
        stroke="#6FD3E8"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 55 L20 36 L39 36"
        stroke="#6FD3E8"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="46" cy="62" r="15.5" fill="#6FD3E8" />
    </g>
    </g>

    {/* --- Female glyph: right arm of the W --- */}
    <g className="wl-female-orbit">
    <g className="wl-female">
      <path
        d="M167 63 L167 100 M156 90 L178 90"
        stroke="#FFDCA8"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="167" cy="63" r="14.5" fill="#FFDCA8" />
    </g>
    </g>
  </svg>
);

export default WobbleLogo;
