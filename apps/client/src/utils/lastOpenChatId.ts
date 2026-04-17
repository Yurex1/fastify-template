export const getLastChatId = () => {
  const lastChatId = sessionStorage.getItem('chatId') || null;
  return Number(lastChatId);
};

export const setLastChatId = (chatId: number) => {
  sessionStorage.setItem('chatId', chatId.toString());
};

export const clearLastChatId = () => {
  sessionStorage.removeItem('chatId');
};
