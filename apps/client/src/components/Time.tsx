interface TimeProps {
  date: string;
  text?: string;
  additionalStyles?: string;
}

const Time = ({ date, text, additionalStyles }: TimeProps) => {
  return (
    <small className={`text-gray-300 text-[10px] leading-[8px] ${additionalStyles}`}>
      {text && text}
      {new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </small>
  );
};

export default Time;
