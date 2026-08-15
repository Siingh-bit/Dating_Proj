import { createContext, useContext, useReducer } from "react";
import { CURRENT_USER } from "../data/mockData";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isAuthenticated: true, user: action.payload };
    case "LOGOUT":
      return { ...state, isAuthenticated: false, user: null };
    case "UPDATE_PROFILE":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_ONBOARDED":
      return { ...state, isOnboarded: true };
    case "UPGRADE_TIER": {
      const tierSlots = { free: 1, lite: 3, plus: 5, elite: 10 };
      const tierEnds = { free: 2, lite: 3, plus: 5, elite: 7 };
      return {
        ...state,
        user: {
          ...state.user,
          tier: action.payload,
          conversation_slots: tierSlots[action.payload],
          weekly_ends_max: tierEnds[action.payload],
          weekly_ends_remaining: tierEnds[action.payload],
        },
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
