import { Copy, PencilIcon, TrashIcon } from 'lucide-react';
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from './ui/context-menu';

interface UniversalMenuProps {
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete: () => void;
  isOwnMessage?: boolean;
  additional?: React.ReactNode;
}

export default function ContextMenu({ onEdit, onCopy, onDelete, isOwnMessage, additional }: UniversalMenuProps) {
  const topItems = [
    onEdit && { id: 1, text: 'Edit', icon: <PencilIcon size={16} />, onClick: onEdit },
    onCopy && { id: 2, text: 'Copy', icon: <Copy size={16} />, onClick: onCopy },
  ].filter(Boolean);

  return (
    <ContextMenuContent>
      {additional}
      {isOwnMessage && topItems.length > 0 && (
        <>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuGroup>
            {topItems.map((item: any) => (
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
