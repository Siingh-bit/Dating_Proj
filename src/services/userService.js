import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PROFILES, CURRENT_USER, CONVERSATIONS } from '../data/mockData';

/**
 * Get an existing user profile or create a new one in Supabase
 */
export async function getOrCreateUserProfile(email, initialData = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ...CURRENT_USER,
      email,
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
      tier: 'free',
      verified: true,
      daily_likes_remaining: 10,
      weekly_ends_remaining: 2,
    };

    const { data: created, error: insertErr } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (insertErr) {
      console.warn('[Wobble Date] Could not insert to Supabase, using local profile fallback', insertErr);
      return { ...CURRENT_USER, ...newProfile };
    }

    return { ...CURRENT_USER, ...created };
  } catch (err) {
    console.error('[Wobble Date] Profile service error:', err);
    return { ...CURRENT_USER, email, ...initialData };
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
 * Fetch available profiles for Discover swipe deck
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
      .limit(30);

    if (error || !data || data.length === 0) {
      return PROFILES;
    }
    return data;
  } catch (err) {
    return PROFILES;
  }
}
