import type { Message } from "../api/auth/types";
const WS_URL = import.meta.env.VITE_WS_URL;

export const sendMessage = (
  ws: WebSocket | null,
  chatId: number,
  text: string,
) => {
  if (!ws || ws.readyState !== WebSocket.OPEN || !chatId) return;
  ws.send(
    JSON.stringify({
      type: "SEND_MESSAGE",
      payload: { chatId, text: text.trim() },
    }),
  );
};

export const updateMessage = (
  ws: WebSocket | null,
  messageId: number,
  text: string,
) => {
  if (!ws || ws.readyState !== WebSocket.OPEN || !messageId) return;
  ws.send(
    JSON.stringify({
      type: "UPDATE_MESSAGE",
      payload: { messageId, text: text.trim() },
    }),
  );
};

export const deleteMessage = (ws: WebSocket | null, messageId: number) => {
  if (!ws || ws.readyState !== WebSocket.OPEN || !messageId) return;
  ws.send(
    JSON.stringify({
      type: "DELETE_MESSAGE",
      payload: { messageId },
    }),
  );
};

export default function createWebSocket(
  token: string,
  chatIdRef: React.RefObject<number>,
  setWs: (ws: WebSocket) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) {
  const socket = new WebSocket(`${WS_URL}/ws/${token}`);

  socket.onopen = () => {
    console.log("WS Connected");
    setWs(socket);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "NEW_MESSAGE") {
      const newMessage = data.payload;

      if (newMessage.chatId !== chatIdRef.current) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    }

    if (data.type === "MESSAGE_UPDATED") {
      const updated = data.payload;
      setMessages((prev) =>
        prev.map((message) => (message.id === updated.id ? updated : message)),
      );
    }

    if (data.type === "MESSAGE_DELETED") {
      const deleted = data.payload;
      setMessages((prev) =>
        prev.filter((message) => message.id !== deleted.messageId),
      );
    }
  };

  socket.onerror = (e) => console.error("WS Error", e);
  socket.onclose = () => {
    console.log("WS Disconnected");
    setWs(null);
  };

  return socket;
}
