import { Copy, PencilIcon, TrashIcon } from 'lucide-react';
import { ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuSeparator } from './ui/context-menu';

interface UniversalMenuProps {
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete: () => void;
}

export default function ContextMenu({ onEdit, onCopy, onDelete }: UniversalMenuProps) {
  const topItems = [
    onEdit && { id: 1, text: 'Edit', icon: <PencilIcon size={16} />, onClick: onEdit },
    onCopy && { id: 2, text: 'Copy', icon: <Copy size={16} />, onClick: onCopy },
  ].filter(Boolean);

  return (
    <ContextMenuContent>
      {topItems.length > 0 && (
        <>
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
        <ContextMenuItem onClick={onDelete} variant="destructive">
          <TrashIcon size={16} />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}
