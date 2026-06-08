import { formatLastSeen } from '../utils/formatLastSeen';
import { useTranslation } from 'react-i18next';

interface UserStatusProps {
  lastSeen: string;
  isOnline: boolean;
}

export const UserStatus = ({ lastSeen, isOnline }: UserStatusProps) => {
  const { t } = useTranslation();

  if (isOnline) return <small className="text-green-600">{t('userStatus.lastSeen.online')}</small>;

  return (
    <small>
      {t('userStatus.lastSeen.last')}: {formatLastSeen(lastSeen)}
    </small>
  );
};
