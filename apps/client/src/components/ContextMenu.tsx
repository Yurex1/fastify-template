import { Copy, PencilIcon, Pin, Reply, TrashIcon } from 'lucide-react';
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from './ui/context-menu';
import type { JSX } from 'react';

interface UniversalMenuProps {
  onEdit?: () => void;
  onCopy?: () => void;
  onPin?: () => void;
  onReply?: () => void;
  isPinned?: boolean;
  onDelete: () => void;
  isOwnMessage?: boolean;
  children?: React.ReactNode;
}
interface MenuItemProps {
  id: number;
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}

export default function ContextMenu({
  onEdit,
  onCopy,
  onPin,
  isPinned,
  onReply,
  onDelete,
  isOwnMessage,
  children,
}: UniversalMenuProps) {
  const topItems = [
    onEdit && isOwnMessage && { id: 1, text: 'Edit', icon: <PencilIcon size={16} />, onClick: onEdit },
    onCopy && { id: 2, text: 'Copy', icon: <Copy size={16} />, onClick: onCopy },
    onPin && { id: 3, text: isPinned ? 'Unpin' : 'Pin', icon: <Pin size={16} />, onClick: onPin },
    onReply && { id: 4, text: 'Reply', icon: <Reply size={16} />, onClick: onReply },
  ].filter((item): item is MenuItemProps => Boolean(item));

  return (
    <ContextMenuContent>
      {children}
      {topItems.length > 0 && (
        <>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuGroup>
            {topItems.map((item) => (
              <ContextMenuItem key={item.id} onClick={item.onClick}>
                {item.icon}
                <span>{item.text}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuGroup>
          <ContextMenuSeparator />
        </>
      )}

      <ContextMenuGroup>
        <ContextMenuLabel>Danger</ContextMenuLabel>
        <ContextMenuItem onClick={onDelete} variant="destructive">
          <TrashIcon size={16} />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}
