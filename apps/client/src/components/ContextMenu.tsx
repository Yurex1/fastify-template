import { Copy, PencilIcon, Pin, Reply, TrashIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from './ui/context-menu';
import useChatUIStore from '../stores/chatUI';
import type { JSX } from 'react';

interface Item {
  id: string;
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}

interface ContextMenuProps {
  onDelete: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  isOwn?: boolean;
  children?: React.ReactNode;
  title?: string;
}

export default function ContextMenu({
  onDelete,
  onEdit,
  onCopy,
  onReply,
  onPin,
  isPinned,
  isOwn,
  children,
  title = 'actions',
}: ContextMenuProps) {
  const { t } = useTranslation();
  const pinnedMode = useChatUIStore((s) => s.pinnedMode);
  const items = [
    onEdit &&
      !pinnedMode &&
      isOwn && { id: 'edit', text: t('contextMenu.edit'), icon: <PencilIcon size={16} />, onClick: onEdit },
    onCopy && { id: 'copy', text: t('contextMenu.copy'), icon: <Copy size={16} />, onClick: onCopy },
    onPin && {
      id: 'pin',
      text: isPinned ? t('contextMenu.unpin') : t('contextMenu.pin'),
      icon: <Pin size={16} />,
      onClick: onPin,
    },
    onReply &&
      !pinnedMode && { id: 'reply', text: t('contextMenu.reply'), icon: <Reply size={16} />, onClick: onReply },
  ].filter((item): item is Item => !!item);

  return (
    <ContextMenuContent className="max-w-60 w-full">
      {children}
      {items.length > 0 && (
        <>
          <ContextMenuLabel>{t(`contextMenu.${title}`)}</ContextMenuLabel>
          <ContextMenuGroup>
            {items.map((item: Item) => (
              <ContextMenuItem key={item.id} onClick={item.onClick}>
                {item.icon}
                <span className="ml-2">{item.text}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuGroup>
          <ContextMenuSeparator />
        </>
      )}

      <ContextMenuGroup>
        <ContextMenuLabel>{t('contextMenu.danger')}</ContextMenuLabel>
        <ContextMenuItem onClick={onDelete} variant="destructive">
          <TrashIcon size={16} />
          <span className="ml-2">{t('contextMenu.delete')}</span>
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}
