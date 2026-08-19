import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = 'wobble_auth_user';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to parse stored auth user', err);
    return null;
  }
}

const savedUser = getStoredUser();

const initialState = {
  user: savedUser || null,
  isAuthenticated: !!savedUser,
  isOnboarded: !!savedUser,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      // A LOGIN with no payload used to fall back to the seeded demo account,
      // which would sign a real visitor in as someone else's profile.
      const user = action.payload;
      if (!user) {
        console.error('[Wobble Date] LOGIN dispatched without a user payload — ignoring.');
        return state;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (err) {
        console.error('Failed to save user session', err);
      }
      return { ...state, isAuthenticated: true, user, isOnboarded: true };
    }
    case "LOGOUT": {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {}
      return { ...state, isAuthenticated: false, user: null, isOnboarded: false };
    }
    case "UPDATE_PROFILE": {
      const updatedUser = { ...state.user, ...action.payload };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (err) {}
      return { ...state, user: updatedUser };
    }
    case "SET_ONBOARDED":
      return { ...state, isOnboarded: true };
    case "UPGRADE_TIER": {
      const tierSlots = { free: 1, lite: 3, plus: 5, elite: 10 };
      const tierEnds = { free: 2, lite: 3, plus: 5, elite: 7 };
      const upgradedUser = {
        ...state.user,
        tier: action.payload,
        conversation_slots: tierSlots[action.payload],
        weekly_ends_max: tierEnds[action.payload],
        weekly_ends_remaining: tierEnds[action.payload],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(upgradedUser));
      } catch (err) {}
      return {
        ...state,
        user: upgradedUser,
      };
    }
    case "USE_DAILY_LIKE":
      return {
        ...state,
        user: {
          ...state.user,
          daily_likes_remaining: Math.max(0, state.user.daily_likes_remaining - 1),
        },
      };
    case "USE_WEEKLY_END":
      return {
        ...state,
        user: {
          ...state.user,
          weekly_ends_remaining: Math.max(0, state.user.weekly_ends_remaining - 1),
        },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
