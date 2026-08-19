import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PROFILES, CURRENT_USER } from '../data/mockData';
import { sendProfileApprovedEmail } from './emailService';

const ADMIN_EMAILS = ['wobblesupport@gmail.com', 'admin@wobbledate.com', 'prathmesh@wobbledate.com'];

/**
 * Check if an email has admin/creator privileges
 */
export function isSuperAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some(admin => admin.toLowerCase() === email.toLowerCase());
}

/**
 * Get an existing user profile or create a new one in Supabase
 */
export async function getOrCreateUserProfile(email, initialData = {}) {
  const isAdmin = isSuperAdminEmail(email);

  if (!isSupabaseConfigured || !supabase) {
    // Local / offline fallback
    const localStatus = isAdmin ? 'approved' : 'pending';
    return {
      ...CURRENT_USER,
      email,
      verification_status: localStatus,
      verified: isAdmin,
      is_admin: isAdmin,
      live_selfie_url: initialData.live_selfie_url || CURRENT_USER.photos?.[0],
      govt_id_url: initialData.govt_id_url || null,
      govt_id_status: initialData.govt_id_url ? 'uploaded' : 'none',
      ...initialData,
    };
  }

  try {
    // 1. Check if user profile already exists
    const { data: existingUser, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser && !fetchErr) {
      return {
        ...CURRENT_USER,
        ...existingUser,
        verification_status: existingUser.verification_status || (isAdmin ? 'approved' : 'pending'),
        verified: Boolean(existingUser.verified || isAdmin),
        is_admin: isAdmin,
        live_selfie_url: existingUser.live_selfie_url || existingUser.photos?.[0] || CURRENT_USER.photos?.[0],
        govt_id_url: existingUser.govt_id_url || null,
        govt_id_status: existingUser.govt_id_status || (existingUser.govt_id_url ? 'uploaded' : 'none'),
        photos: existingUser.photos?.length ? existingUser.photos : CURRENT_USER.photos,
        prompts: existingUser.prompts?.length ? existingUser.prompts : CURRENT_USER.prompts,
        vitals: existingUser.vitals && Object.keys(existingUser.vitals).length ? existingUser.vitals : CURRENT_USER.vitals,
      };
    }

    // 2. If new user, create a new profile in Supabase
    const newProfile = {
      id: crypto.randomUUID(),
      email,
      name: initialData.name || email.split('@')[0],
      age: initialData.age || 24,
      gender: initialData.gender || 'male',
      interested_in: initialData.interested_in || 'female',
      location: initialData.location || 'Mumbai, India',
      bio: initialData.bio || '',
      photos: initialData.photos || CURRENT_USER.photos,
      prompts: initialData.prompts || CURRENT_USER.prompts,
      interests: initialData.interests || CURRENT_USER.interests,
      languages: initialData.languages || CURRENT_USER.languages,
      vitals: initialData.vitals || CURRENT_USER.vitals,
      live_selfie_url: initialData.live_selfie_url || CURRENT_USER.photos?.[0],
      govt_id_url: initialData.govt_id_url || null,
      govt_id_status: initialData.govt_id_url ? 'uploaded' : 'none',
      tier: 'free',
      verified: isAdmin,
      verification_status: isAdmin ? 'approved' : 'pending',
      daily_likes_remaining: 10,
      weekly_ends_remaining: 2,
    };

    const { data: created, error: insertErr } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (insertErr) {
      console.warn('[Wobble Date] Could not insert to Supabase, using local fallback', insertErr);
      return { ...CURRENT_USER, ...newProfile, is_admin: isAdmin };
    }

    return { ...CURRENT_USER, ...created, is_admin: isAdmin };
  } catch (err) {
    console.error('[Wobble Date] Profile service error:', err);
    return {
      ...CURRENT_USER,
      email,
      verification_status: isAdmin ? 'approved' : 'pending',
      verified: isAdmin,
      is_admin: isAdmin,
      ...initialData,
    };
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
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

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
 * =========================================================================
 * SUPER ADMIN & CREATOR METHODS
 * =========================================================================
 */

// Demo government ID cards for mock review preview in admin
const DEMO_GOVT_IDS = [
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
];

/**
 * Fetch all registered user profiles for the Super Admin review portal
 */
export async function fetchAllAdminProfiles() {
  if (!isSupabaseConfigured || !supabase) {
    // Return mock curated profiles with mixed verification status for testing
    return PROFILES.map((p, idx) => ({
      ...p,
      email: `${p.name.toLowerCase()}@wobblepreview.com`,
      verification_status: idx < 3 ? 'pending' : 'approved',
      verified: idx >= 3,
      live_selfie_url: p.photos?.[0],
      govt_id_url: idx % 2 === 0 ? p.photos?.[1] : null,
      govt_id_status: idx % 2 === 0 ? (idx >= 3 ? 'verified' : 'uploaded') : 'none',
      created_at: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
    }));
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return PROFILES.map((p, idx) => ({
        ...p,
        email: `${p.name.toLowerCase()}@wobblepreview.com`,
        verification_status: idx < 3 ? 'pending' : 'approved',
        verified: idx >= 3,
        live_selfie_url: p.photos?.[0],
        govt_id_url: idx % 2 === 0 ? p.photos?.[1] : null,
        govt_id_status: idx % 2 === 0 ? (idx >= 3 ? 'verified' : 'uploaded') : 'none',
        created_at: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
      }));
    }

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
