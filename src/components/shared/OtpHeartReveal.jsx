import React from 'react';
import './OtpHeartReveal.css';

/**
 * The six OTP digits fly inward, collapse into a point, and a heart blooms
 * out of them.
 *
 * Lives here rather than inside a page because two different sign-in surfaces
 * need it: the dedicated /auth screen and the modal on the landing page. The
 * landing modal previously showed only a pulsing logo, so the live site never
 * played this at all.
 *
 * Total run time is ~4s; callers should keep their navigation delay in step
 * with REVEAL_DURATION below.
 */
export const REVEAL_DURATION = 3900;

export default function OtpHeartReveal({ digits = [], title, subtitle }) {
  // Fall back to six blanks so the flight still reads if digits aren't passed.
  const cells = digits.length === 6 ? digits : ['', '', '', '', '', ''];

  return (
    <div className="ohr-root">
      <div className="ohr-stage">
        {cells.map((digit, i) => (
          <span
            key={i}
            className="ohr-digit"
            style={{
              // spread the six digits across their original input positions
              '--start-x': `${(i - 2.5) * 52}px`,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            {digit}
          </span>
        ))}

        <svg className="ohr-heart" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"
            fill="var(--accent)"
          />
        </svg>
      </div>

      <div className="ohr-message">
        <h3>{title || 'Welcome to Wobble Date'}</h3>
        <p>{subtitle || 'Setting up your account'}</p>
      </div>
    </div>
  );
}
