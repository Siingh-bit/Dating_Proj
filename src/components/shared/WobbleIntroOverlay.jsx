import React from 'react';
import WobbleLogo from './WobbleLogo';
import './WobbleIntroOverlay.css';

/**
 * The mark assembling itself: the male and female glyphs pop in on the ends of
 * the W, orbit a full turn about the mark's centre, and settle back into place
 * while the W draws itself in underneath.
 *
 * This used to live only inside AuthPage, which the live site never routes
 * through — so on wobbledate.com it had never played once. Sharing it means
 * the landing modal and /auth both show the same intro.
 *
 * The parent must be `position: relative` (or fixed/absolute); this fills it.
 */
export const INTRO_DURATION = 1900;

export default function WobbleIntroOverlay({ className = '' }) {
  return (
    <div className={`wintro-overlay ${className}`.trim()}>
      <WobbleLogo animated className="wintro-mark" />
      <h2 className="wintro-name">Wobble Date</h2>
    </div>
  );
}
