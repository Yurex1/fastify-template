import { cn } from '../lib/utils';

interface TimeProps {
  date: string;
  text?: string;
  additionalStyles?: string;
}

const Time = ({ date, text, additionalStyles }: TimeProps) => {
  return (
    <small className={cn('text-gray-300 text-xs', additionalStyles)}>
      {text && text}
      {new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </small>
  );
};

export default Time;
