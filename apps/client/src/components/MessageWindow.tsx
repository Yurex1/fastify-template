import { useEffect, useLayoutEffect, useRef, useState } from 'react';
// import TextareaAutosize from 'react-textarea-autosize';
import { useAuthStore } from '../stores/auth';
import { getAccessToken } from '../utils/auth/accessToken';
import chatsApi from '../api/chats/chats';
import createWebSocket from '../services/chatSocket'; // updateMessage, // sendMessage, // deleteMessage,
import type { Message } from '../api/auth/types';
import MessageForm from './MessageForm';

const MessageWindow = ({ currentChatId }: { currentChatId: number | null }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  // const [text, setText] = useState<string>('');
  // const [formMode, setFormMode] = useState<FormMode>('create');
  // const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef(currentChatId);

  const token = getAccessToken();
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    chatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    if (!currentChatId) return;
    // fetchMessages(currentChatId);
    const loadInitialMessages = async () => {
      setIsLoading(true);
      setPage(1);
      setHasMore(true);

      try {
        const response = (await chatsApi.getMessageByChatId(currentChatId)) as Message[];
        setMessages(response);
      } catch (err) {
        console.error(err);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialMessages();
  }, [currentChatId]);

  const loadMoreMessages = async () => {
    if (!currentChatId || !hasMore || isLoading) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const olderMessages = (await chatsApi.getMessageByChatId(currentChatId, nextPage)) as Message[];

      if (olderMessages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...olderMessages, ...prev]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (messagesEndRef.current && messages.length > 0 && isInitialLoad) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  // useEffect(() => {
  //   if (messagesEndRef.current && messages.length > 0 && !isInitialLoad) {
  //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages.length]);

  useEffect(() => {
    if (!token) return;
    const socket = createWebSocket(token, chatIdRef, setWs, setMessages);

    return () => !!socket && socket.close();
  }, [token]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    console.log(container);
    if (!container) return;

    // const handleScroll = () => {
    //   if (container.scrollTop === 0 && hasMore && !isLoading) {
    //     loadMoreMessages();
    //   }
    // };
    function handleScroll() {
      if (container.scrollTop < 250 && hasMore && !isLoading) {
        console.log(container.scrollTop);
        loadMoreMessages();
      }
      if (container.scrollHeight - container.scrollTop - window.innerHeight < 50) {
        // setIsLoading(true);
        window.scrollTo(0, container.scrollHeight + container.scrollTop);
      }
    }

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, currentChatId]);

  // async function fetchMessages(chatId: number) {
  //   try {
  //     const response = (await chatsApi.getMessageByChatId(
  //       chatId,
  //       page,
  //     )) as Message[];
  //     setMessages(response);
  //   } catch (error) {
  //     console.error("Fetch messages error", error);
  //     setMessages([]);
  //   }
  // }

  // const handleSend = (e: React.SubmitEvent) => {
  //   e.preventDefault();
  //   if (formMode === "create") {
  //     sendMessage(ws, currentChatId, text);
  //   } else {
  //     updateMessage(ws, messageToEdit.id, text);
  //     setMessageToEdit(null);
  //     setFormMode("create");
  //   }
  //   setText("");
  // };

  if (!currentChatId || !currentUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">Виберіть чат</div>;
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 h-screen overflow-hidden">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1 flex flex-col">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-3 py-2 rounded-2xl max-w-[80%] ${
                m.userId === currentUser.id
                  ? 'bg-violet-700 text-white rounded-tr-none'
                  : 'bg-gray-800 text-white rounded-tl-none'
              }`}
            >
              <p className="text-sm break-words text-start leading-[25px]">{m.text}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                {m.createdAt !== m.updatedAt && <p className="text-[10px] opacity-[0.7]">edited</p>}
                <small className="text-gray-300 !text-[10px] leading-[2px]">
                  {new Date(m.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
                {/* {m.userId === currentUser.id && (
                  <button
                    onClick={() => {
                      setFormMode("edit");
                      setMessageToEdit(m);
                      setText(m.text);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-[10px] uppercase font-bold"
                  >
                    Edit
                  </button>
                )} */}

                {/* {m.userId === currentUser.id && (
                  <button
                    onClick={() => {
                      deleteMessage(ws, m.id);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-[10px] uppercase font-bold"
                  >
                    Delete
                  </button>
                )} */}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* <form
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
      </form> */}
      <MessageForm currentChatId={currentChatId} ws={ws} />
    </div>
  );
};

export default MessageWindow;
