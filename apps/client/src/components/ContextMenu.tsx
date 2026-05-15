import { Copy, PencilIcon, Pin, Reply, TrashIcon } from 'lucide-react';
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from './ui/context-menu';
import useChatUIStore from '../stores/chatUI';

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
  title = 'Actions',
}: ContextMenuProps) {
  const pinnedMode = useChatUIStore((s) => s.pinnedMode);
  const items = [
    onEdit && !pinnedMode && isOwn && { id: 'edit', text: 'Edit', icon: <PencilIcon size={16} />, onClick: onEdit },
    onCopy && { id: 'copy', text: 'Copy', icon: <Copy size={16} />, onClick: onCopy },
    onPin && { id: 'pin', text: isPinned ? 'Unpin' : 'Pin', icon: <Pin size={16} />, onClick: onPin },
    onReply && !pinnedMode && { id: 'reply', text: 'Reply', icon: <Reply size={16} />, onClick: onReply },
  ].filter(Boolean);

  return (
    <ContextMenuContent className="max-w-60 w-full">
      {children}
      {items.length > 0 && (
        <>
          <ContextMenuLabel>{title}</ContextMenuLabel>
          <ContextMenuGroup>
            {items.map((item: any) => (
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
        <ContextMenuLabel>Danger</ContextMenuLabel>
        <ContextMenuItem onClick={onDelete} variant="destructive">
          <TrashIcon size={16} />
          <span className="ml-2">Delete</span>
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}
