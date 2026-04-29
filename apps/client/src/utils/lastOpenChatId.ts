export const getLastChatId = () => {
  const lastChatId = sessionStorage.getItem('chatId') || null;
  return lastChatId ? Number(lastChatId) : null;
};

export const setLastChatId = (chatId: number | null) => {
  if (chatId === null) {
    sessionStorage.removeItem('chatId');
  } else {
    sessionStorage.setItem('chatId', chatId.toString());
  }
};

export const clearLastChatId = () => {
  sessionStorage.removeItem('chatId');
};
