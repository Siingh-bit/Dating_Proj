import { createContext, useContext, useReducer } from "react";
import { MATCHES, CONVERSATIONS, INCOMING_LIKES } from "../data/mockData";

const ConversationContext = createContext(null);

const initialState = {
  matches: MATCHES,
  conversations: CONVERSATIONS,
  incomingLikes: INCOMING_LIKES,
};

function conversationReducer(state, action) {
  switch (action.type) {
    case "START_CONVERSATION": {
      const { matchId } = action.payload;
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, isActiveConversation: true, phase: "talking" } : m
        ),
        conversations: {
          ...state.conversations,
          [matchId]: state.conversations[matchId] || { matchId, messages: [] },
        },
      };
    }

    case "END_CONVERSATION": {
      const { matchId } = action.payload;
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, isActiveConversation: false } : m
        ),
      };
    }

    case "SEND_MESSAGE": {
      const { matchId, text, gameData } = action.payload;
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: "user-self",
        text,
        gameData,
        timestamp: new Date().toISOString(),
      };
      const existing = state.conversations[matchId] || { matchId, messages: [] };
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [matchId]: {
            ...existing,
            messages: [...existing.messages, newMessage],
          },
        },
        matches: state.matches.map((m) =>
          m.id === matchId
            ? { ...m, lastMessage: { text, sender: "user-self", timestamp: newMessage.timestamp, read: false } }
            : m
        ),
      };
    }

    case "SEND_MEDIA_MESSAGE": {
      const { matchId, photoUrl, mode, caption } = action.payload;
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: "user-self",
        text: caption || (mode === "view_once" ? "📷 View Once Photo" : "📷 Photo"),
        media: {
          url: photoUrl,
          mode: mode,
          viewed: false,
        },
        timestamp: new Date().toISOString(),
      };
      const existing = state.conversations[matchId] || { matchId, messages: [] };
      const updatedMessages = [...existing.messages, newMessage];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [matchId]: {
            ...existing,
            messages: updatedMessages,
          },
        },
        matches: state.matches.map((m) =>
          m.id === matchId
            ? { ...m, lastMessage: { text: newMessage.text, sender: "user-self", timestamp: newMessage.timestamp, read: false } }
            : m
        ),
      };
    }

    case "VIEW_ONCE_OPENED": {
      const { matchId, messageId } = action.payload;
      const existing = state.conversations[matchId];
      if (!existing) return state;
      const updatedMessages = existing.messages.map((msg) => {
        if (msg.id === messageId && msg.media && msg.media.mode === "view_once") {
          return {
            ...msg,
            media: {
              ...msg.media,
              viewed: true,
            },
          };
        }
        return msg;
      });
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [matchId]: {
            ...existing,
            messages: updatedMessages,
          },
        },
      };
    }

    case "UNSEND_MESSAGE": {
      const { matchId, messageId } = action.payload;
      const existing = state.conversations[matchId];
      if (!existing) return state;
      const updatedMessages = existing.messages.filter((msg) => msg.id !== messageId);
      const lastMsg = updatedMessages[updatedMessages.length - 1];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [matchId]: {
            ...existing,
            messages: updatedMessages,
          },
        },
        matches: state.matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                lastMessage: lastMsg
                  ? { text: lastMsg.text, sender: lastMsg.sender, timestamp: lastMsg.timestamp, read: true }
                  : null,
              }
            : m
        ),
      };
    }

    case "UPDATE_PHASE": {
      const { matchId, phase } = action.payload;
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === matchId ? { ...m, phase } : m
        ),
      };
    }

    case "ACCEPT_LIKE": {
      const { likeId, profile } = action.payload;
      const newMatch = {
        id: `m-${Date.now()}`,
        matchedWith: profile,
        matchedAt: new Date().toISOString(),
        phase: "liking",
        isActiveConversation: false,
        lastMessage: null,
      };
      return {
        ...state,
        matches: [...state.matches, newMatch],
        incomingLikes: state.incomingLikes.filter((l) => l.id !== likeId),
      };
    }

    case "REJECT_LIKE":
      return {
        ...state,
        incomingLikes: state.incomingLikes.filter((l) => l.id !== action.payload),
      };

    default:
      return state;
  }
}

export function ConversationProvider({ children }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  const activeConversations = state.matches.filter((m) => m.isActiveConversation);

  const value = {
    ...state,
    activeConversations,
    activeCount: activeConversations.length,
    dispatch,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (!context) throw new Error("useConversations must be used within ConversationProvider");
  return context;
}
