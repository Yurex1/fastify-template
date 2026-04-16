import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import type { FormMode, Message } from "../api/auth/types";
import {
  // deleteMessage,
  sendMessage,
  updateMessage,
} from "../services/chatSocket";

const MessageForm = ({
  currentChatId,
  ws,
}: {
  currentChatId: number | null;
  ws: WebSocket;
}) => {
  const [text, setText] = useState<string>("");
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);
  const handleSend = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (text.trim().length <= 0) return;
    if (formMode === "create") {
      sendMessage(ws, currentChatId, text);
    } else {
      updateMessage(ws, messageToEdit.id, text);
      setMessageToEdit(null);
      setFormMode("create");
    }
    setText("");
  };

  return (
    <form
      onSubmit={handleSend}
      className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2 items-end"
    >
      <TextareaAutosize
        cacheMeasurements
        value={text}
        onChange={(e) => setText(e.target.value)}
        minRows={1}
        maxRows={10}
        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
        placeholder="Напишіть повідомлення..."
      />
      <button className="bg-blue-600 px-3 py-2 h-[55px] rounded-xl text-white font-medium hover:bg-blue-500 transition-colors">
        {formMode === "create" ? "➣" : "✓"}
      </button>
    </form>
  );
};

export default MessageForm;
