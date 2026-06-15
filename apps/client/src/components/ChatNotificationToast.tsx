interface ChatNotificationToastProps {
  avatar?: string;
  title?: string;
  body?: string;
  onClick?: () => void;
}

export const ChatNotificationToast: React.FC<ChatNotificationToastProps> = ({ avatar, title, body, onClick }) => {
  return (
    <div onClick={onClick} className="flex gap-3 items-start">
      {avatar && <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />}
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm opacity-80">{body}</div>
      </div>
    </div>
  );
};
