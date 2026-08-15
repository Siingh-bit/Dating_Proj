export function canStartConversation(user, activeCount) {
  return activeCount < user.conversation_slots;
}

export function canEndConversation(user) {
  return user.weekly_ends_remaining > 0;
}

export function getSlotDisplay(user, activeCount) {
  return `${activeCount}/${user.conversation_slots}`;
}

export function getEndsDisplay(user) {
  return `${user.weekly_ends_remaining}/${user.weekly_ends_max}`;
}

export function getTierName(tier) {
  const names = { free: "Standard", lite: "Lite", plus: "Plus", elite: "Elite" };
  return names[tier] || "Standard";
}
