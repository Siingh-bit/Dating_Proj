/**
 * Wobble Date — Brevo Email Service
 * Handles transactional OTP email delivery via Brevo v3 REST API.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Default sender configured for Wobble Date
export const SENDER_CONFIG = {
  name: 'Wobble Date',
  email: import.meta.env.VITE_SENDER_EMAIL || 'wobblesupport@gmail.com',
};

/**
 * Generate a luxury branded HTML email template for Wobble Date OTP
 */
function createOtpEmailTemplate(otpCode) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Wobble Date Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0C0A10;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #F5F0EB;
    }
    .email-container {
      max-width: 540px;
      margin: 30px auto;
      background: #1A1626;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #231E32 0%, #1A1626 100%);
      padding: 36px 24px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .logo-text {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin-top: 8px;
    }
    .logo-sub {
      font-size: 12px;
      color: #FF7B6B;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 14px;
      color: #9B95A5;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .otp-card {
      background: #0C0A10;
      border: 2px solid #E8604C;
      border-radius: 16px;
      padding: 20px;
      display: inline-block;
      margin-bottom: 24px;
      box-shadow: 0 0 24px rgba(232, 96, 76, 0.25);
    }
    .otp-number {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #FFFFFF;
      font-family: 'Courier New', Courier, monospace;
    }
    .expiry-note {
      font-size: 12px;
      color: #FFD700;
      font-weight: 600;
      margin-bottom: 28px;
    }
    .security-tips {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 16px;
      text-align: left;
      font-size: 12px;
      color: #9B95A5;
      line-height: 1.5;
    }
    .security-tips strong {
      color: #F5F0EB;
    }
    .footer {
      background: #0C0A10;
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #5A5465;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .footer a {
      color: #FF7B6B;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div style="font-size: 32px;">💖</div>
      <div class="logo-text">Wobble Date</div>
      <div class="logo-sub">wobbledate.com</div>
    </div>

    <div class="content">
      <div class="title">Verification Code</div>
      <div class="subtitle">
        Enter the code below to log in or create your profile on Wobble Date.
      </div>

      <div class="otp-card">
        <div class="otp-number">${otpCode}</div>
      </div>

      <div class="expiry-note">
        ⏳ This code is valid for 10 minutes.
      </div>

      <div class="security-tips">
        <strong>🔒 Security Notice:</strong> Never share this verification code with anyone. Wobble Date team members will never ask for your code. If you did not request this email, you can safely ignore it.
      </div>
    </div>

    <div class="footer">
      © 2026 Wobble Date. All rights reserved.<br>
      Chemistry-First Dating Platform • <a href="https://wobbledate.com">wobbledate.com</a>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Send an OTP email to the recipient using Brevo REST API
 * @param {string} recipientEmail - Email of the user
 * @param {string} otpCode - 6 digit verification code
 * @returns {Promise<{ success: boolean, message?: string, error?: any }>}
 */
export async function sendBrevoOtpEmail(recipientEmail, otpCode) {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY || (typeof window !== 'undefined' ? window.__BREVO_API_KEY__ : null);

  if (!apiKey) {
    // This used to return success:true in "dev fallback" mode, which meant a
    // live deploy with a missing key told users "we sent a code" and then
    // never sent one. Failing loudly is the only safe behaviour in production.
    console.error(
      '[Wobble Date Email Service] VITE_BREVO_API_KEY is not set — cannot send verification emails.'
    );
    return {
      success: false,
      mode: 'not_configured',
      error: 'Email service is not configured.',
    };
  }

  const payload = {
    sender: SENDER_CONFIG,
    to: [
      {
        email: recipientEmail,
      },
    ],
    subject: `${otpCode} is your Wobble Date verification code`,
    htmlContent: createOtpEmailTemplate(otpCode),
    textContent: `Your Wobble Date verification code is: ${otpCode}. It will expire in 10 minutes.`,
  };

  // Abort rather than hang forever if the mail API is unreachable — a stalled
  // request here freezes the sign-in screen.
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Wobble Date Email Service] Brevo API Error:', errorData);
      return {
        success: false,
        error: errorData.message || `Failed with status ${response.status}`,
        mode: 'api_error',
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: true,
      messageId: data.messageId,
      mode: 'brevo_live',
    };
  } catch (err) {
    console.error('[Wobble Date Email Service] Network error sending email:', err);
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Request timed out.' : err.message,
      mode: err.name === 'AbortError' ? 'timeout' : 'network_error',
    };
  } finally {
    clearTimeout(abortTimer);
  }
}

/**
 * Branded HTML email template for Profile Approved notification
 */
function createProfileApprovedTemplate(userName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Profile is Officially Verified!</title>
  <style>
    body {
      margin: 0; padding: 0; background-color: #0C0A10;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #F5F0EB;
    }
    .email-container {
      max-width: 540px; margin: 30px auto; background: #1A1626;
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px;
      overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #231E32 0%, #1A1626 100%);
      padding: 36px 24px 24px; text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge {
      display: inline-block; background: rgba(52, 211, 153, 0.15);
      border: 1px solid #34D399; color: #34D399;
      padding: 6px 16px; border-radius: 9999px;
      font-size: 13px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; margin-bottom: 12px;
    }
    .content { padding: 36px 32px; text-align: center; }
    .title { font-size: 24px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; }
    .subtitle { font-size: 15px; color: #9B95A5; line-height: 1.6; margin-bottom: 28px; }
    .cta-btn {
      display: inline-block; background: linear-gradient(135deg, #E8604C 0%, #FF7B6B 100%);
      color: #FFFFFF !important; font-weight: 700; font-size: 16px;
      padding: 16px 36px; border-radius: 9999px; text-decoration: none;
      box-shadow: 0 10px 30px rgba(232, 96, 76, 0.4); margin-bottom: 24px;
    }
    .features-card {
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px; padding: 20px; text-align: left; margin-bottom: 20px;
    }
    .feature-item { margin-bottom: 12px; font-size: 13px; color: #D1CBD8; display: flex; align-items: center; }
    .footer {
      background: #0C0A10; padding: 24px; text-align: center;
      font-size: 11px; color: #5A5465; border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="badge">Verified Member ✨</div>
      <div style="font-size: 32px;">💖</div>
      <div style="font-size: 24px; font-weight: 800; color: #FFF; margin-top: 6px;">Wobble Date</div>
    </div>

    <div class="content">
      <div class="title">Welcome, ${userName || 'there'}! 🎉</div>
      <div class="subtitle">
        Your profile has been reviewed and approved by the Wobble Concierge team. You now have full access to discover genuine connections.
      </div>

      <a href="https://wobbledate.com/app/discover" class="cta-btn">
        Start Discovering Matches →
      </a>

      <div class="features-card">
        <div style="font-size: 12px; font-weight: 700; color: #FF7B6B; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">What's Unlocked:</div>
        <div class="feature-item">✨ <strong>Verified Badge:</strong> Displayed on your profile to build trust.</div>
        <div class="feature-item">🌙 <strong>The Wobble Hour:</strong> 8–9 PM daily speed blind chemistry dates.</div>
        <div class="feature-item">🎮 <strong>Couple Lounge:</strong> 10+ interactive icebreaker games in chat.</div>
        <div class="feature-item">🥂 <strong>Curated Dates:</strong> 1-click real-life cafe & dinner itineraries.</div>
      </div>
    </div>

    <div class="footer">
      © 2026 Wobble Date • Chemistry-First Dating Platform<br>
      <a href="https://wobbledate.com" style="color: #FF7B6B; text-decoration: none;">wobbledate.com</a>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send an email notifying the user that their profile has been approved
 */
export async function sendProfileApprovedEmail(recipientEmail, userName) {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY || (typeof window !== 'undefined' ? window.__BREVO_API_KEY__ : null);

  if (!apiKey) {
    console.log(`[Dev Mode] Profile approved email simulated for ${recipientEmail}`);
    return { success: true, mode: 'fallback' };
  }

  const payload = {
    sender: SENDER_CONFIG,
    to: [{ email: recipientEmail }],
    subject: `🎉 Congratulations ${userName || ''}! Your Wobble Date profile is approved`,
    htmlContent: createProfileApprovedTemplate(userName),
    textContent: `Hi ${userName || 'there'}! Your Wobble Date profile has been approved. Visit https://wobbledate.com to start meeting matches!`,
  };

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });
    return { success: res.ok };
  } catch (err) {
    console.error('Failed to send approval email', err);
    return { success: false, error: err };
  }
}
