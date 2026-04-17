import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { Pencil, Trash2, Copy } from 'lucide-react';
import MenuButton from './MenuBtn';

interface GlobalMenuProps {
  anchorEl: HTMLDivElement | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FloatingMenu = ({ anchorEl, isOpen, onClose, onEdit, onDelete }: GlobalMenuProps) => {
  const {
    refs: { setFloating },
    floatingStyles,
    context,
    isPositioned,
  } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) {
        onClose();
      }
    },
    elements: { reference: anchorEl },
    whileElementsMounted: autoUpdate,
    placement: 'bottom-end',
    middleware: [offset(4), flip(), shift()],
  });

  const dismiss = useDismiss(context, {
    outsidePressEvent: 'pointerdown',
  });

  const role = useRole(context);
  const { getFloatingProps } = useInteractions([dismiss, role]);

  if (!isOpen) return null;

  return (
    <FloatingPortal>
      <div
        ref={setFloating}
        style={{
          ...floatingStyles,
          opacity: isPositioned ? 1 : 0,
          visibility: isPositioned ? 'visible' : 'hidden',
        }}
        {...getFloatingProps()}
        className=" min-w-[160px] w-max bg-white/80 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 
        rounded-2xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.3)] outline-none"
      >
        <div>
          <MenuButton
            onClick={() => {
              onEdit();
              onClose();
            }}
            icon={<Pencil size={16} />}
            label="Редагувати"
          />

          <MenuButton
            onClick={() => {
              navigator.clipboard.writeText(anchorEl?.innerText || '');
              onClose();
            }}
            icon={<Copy size={16} />}
            label="Копіювати"
          />

          <div className="h-[1px] bg-black/5 dark:bg-white/5 my-0.5 mx-1" />

          <MenuButton
            onClick={() => {
              onDelete();
              onClose();
            }}
            icon={<Trash2 size={16} />}
            label="Видалити"
            variant="danger"
          />
        </div>
      </div>
    </FloatingPortal>
  );
};

export default FloatingMenu;
