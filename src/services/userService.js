import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PROFILES, CURRENT_USER } from '../data/mockData';
import { sendProfileApprovedEmail } from './emailService';

const ADMIN_EMAILS = [
  'prathmeshsingh99@gmail.com',
  'wobblesupport@gmail.com',
  'admin@wobbledate.com',
  'prathmesh@wobbledate.com',
];

/**
 * Check if an email has admin/creator privileges
 */
export function isSuperAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some(admin => admin.toLowerCase() === email.toLowerCase());
}

/**
 * Never let a hung network call block the UI.
 *
 * supabase-js has no built-in request timeout, so if the database is slow,
 * unreachable or blocked by a corporate/mobile network the promise simply
 * never settles. Any `await` on it then hangs forever — which is exactly how
 * login got stuck on the verification animation with no error shown.
 */
const NETWORK_TIMEOUT_MS = 8000;

function withTimeout(promise, ms = NETWORK_TIMEOUT_MS, label = 'request') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out: ${label}`)), ms)
    ),
  ]);
}

/**
 * A complete, usable profile built entirely on the client.
 *
 * Exported so sign-in can proceed immediately without waiting on the network:
 * the database is a nice-to-have at that moment, not a prerequisite.
 */
export function buildLocalProfile(email, initialData = {}) {
  const isAdmin = isSuperAdminEmail(email);
  return {
    email,
    name: initialData.name || (email ? email.split('@')[0] : ''),
    age: initialData.age || 24,
    gender: initialData.gender || '',
    interested_in: initialData.interested_in || '',
    sexuality: initialData.sexuality || null,
    location: initialData.location || '',
    bio: '',
    photos: [],
    prompts: [],
    interests: [],
    languages: [],
    vitals: {},
    live_selfie_url: null,
    govt_id_url: null,
    govt_id_status: 'none',
    tier: 'free',
    verified: isAdmin,
    verification_status: isAdmin ? 'approved' : 'unverified',
    profile_completed: isAdmin,
    is_admin: isAdmin,
    daily_likes_remaining: 10,
    weekly_ends_remaining: 2,
    conversation_slots: 1,
  };
}

/**
 * Get an existing user profile or create a clean, empty new user profile.
 *
 * Always resolves — on any failure it returns a usable local profile so the
 * user can still get into the app rather than being stranded at the door.
 */
export async function getOrCreateUserProfile(email, initialData = {}) {
  const isAdmin = isSuperAdminEmail(email);

  const cleanEmptyTemplate = {
    email,
    name: initialData.name || (email ? email.split('@')[0] : ''),
    age: initialData.age || 24,
    gender: initialData.gender || 'male',
    interested_in: initialData.interested_in || 'female',
    location: initialData.location || '',
    bio: '',
    photos: [],
    prompts: [],
    interests: [],
    languages: [],
    vitals: {},
    live_selfie_url: null,
    govt_id_url: null,
    govt_id_status: 'none',
    tier: 'free',
    verified: isAdmin,
    verification_status: isAdmin ? 'approved' : 'unverified',
    profile_completed: isAdmin,
    is_admin: isAdmin,
    daily_likes_remaining: 10,
    weekly_ends_remaining: 2,
  };

  if (!isSupabaseConfigured || !supabase) {
    return cleanEmptyTemplate;
  }

  try {
    // 1. Check if user profile already exists
    const { data: existingUser, error: fetchErr } = await withTimeout(
      supabase.from('profiles').select('*').eq('email', email).maybeSingle(),
      NETWORK_TIMEOUT_MS,
      'profile lookup'
    );

    if (existingUser && !fetchErr) {
      return {
        ...cleanEmptyTemplate,
        ...existingUser,
        verification_status: existingUser.verification_status || (isAdmin ? 'approved' : 'unverified'),
        verified: Boolean(existingUser.verified || isAdmin),
        is_admin: isAdmin,
        photos: existingUser.photos || [],
        prompts: existingUser.prompts || [],
        vitals: existingUser.vitals || {},
        profile_completed: Boolean(existingUser.photos?.length >= 1),
      };
    }

    // 2. If new user, create a clean profile in Supabase
    const newProfile = {
      // crypto.randomUUID needs a secure context and isn't in older iOS
      // Safari / some in-app browsers — fall back rather than throw.
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `u-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      ...cleanEmptyTemplate,
      ...initialData,
    };

    const { data: created, error: insertErr } = await withTimeout(
      supabase.from('profiles').insert(newProfile).select().single(),
      NETWORK_TIMEOUT_MS,
      'profile create'
    );

    if (insertErr) {
      console.warn('[Wobble Date] Insert fallback:', insertErr);
      return newProfile;
    }

    return { ...cleanEmptyTemplate, ...created };
  } catch (err) {
    console.error('[Wobble Date] Profile service error:', err);
    return cleanEmptyTemplate;
  }
}

/**
 * Update user profile in Supabase
 */
export async function updateUserProfile(userId, updates) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { success: true };
  }

  try {
    // Callers await this before navigating, so an untimed request would strand
    // the user on the setup screen exactly like the login hang did.
    const { data, error } = await withTimeout(
      supabase.from('profiles').update(updates).eq('id', userId),
      NETWORK_TIMEOUT_MS,
      'profile update'
    );

    if (error) {
      console.warn('[Wobble Date] Profile update error in Supabase:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Wobble Date] Failed to update profile:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch available profiles for Discover swipe deck (only approved/verified profiles)
 */
export async function fetchDiscoverProfiles(currentUserId) {
  if (!isSupabaseConfigured || !supabase) {
    return PROFILES;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId || '00000000-0000-0000-0000-000000000000')
      .eq('verification_status', 'approved')
      .limit(30);

    if (error || !data || data.length === 0) {
      return PROFILES;
    }
    return data;
  } catch (err) {
    return PROFILES;
  }
}

/**
 * Fetch all registered user profiles for the Super Admin review portal
 */
export async function fetchAllAdminProfiles() {
  // No invented reviewers. If the database isn't reachable the admin must see
  // an empty queue, not fabricated "@wobblepreview.com" users with made-up
  // verification states that could be actioned by mistake.
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      NETWORK_TIMEOUT_MS,
      'admin profile list'
    );

    if (error) {
      console.error('[Wobble Date] Could not load admin profiles:', error);
      return [];
    }
    if (!data) return [];

    return data;
  } catch (err) {
    console.error('Failed to fetch admin profiles:', err);
    return [];
  }
}

/**
 * Approve a user profile: updates verification_status to 'approved',
 * grants optional verified badge, and sends confirmation email via Brevo.
 */
export async function approveUserProfile(userId, email, name, options = { grantBadge: true }) {
  try {
    const isBadgeGranted = Boolean(options?.grantBadge);
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          verification_status: 'approved',
          verified: isBadgeGranted,
          govt_id_status: isBadgeGranted ? 'verified' : 'none',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    // Send confirmation email via Brevo
    if (email) {
      await sendProfileApprovedEmail(email, name);
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to approve profile:', err);
    return { success: false, error: err };
  }
}

/**
 * Reject a user profile
 */
export async function rejectUserProfile(userId, reason = 'Photos or details did not meet community guidelines.') {
  try {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          verification_status: 'rejected',
          verified: false,
          govt_id_status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to reject profile:', err);
    return { success: false, error: err };
  }
}

/**
 * Change a user's subscription tier from the admin panel
 */
export async function setProfileTier(userId, tier) {
  const tierSlots = { free: 1, lite: 3, plus: 5, elite: 10 };
  const tierEnds = { free: 2, lite: 3, plus: 5, elite: 7 };

  try {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({
          tier,
          conversation_slots: tierSlots[tier] || 1,
          weekly_ends_max: tierEnds[tier] || 2,
          weekly_ends_remaining: tierEnds[tier] || 2,
        })
        .eq('id', userId);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * Delete a user profile completely (admin only)
 */
export async function deleteUserProfile(userId) {
  try {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').delete().eq('id', userId);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
