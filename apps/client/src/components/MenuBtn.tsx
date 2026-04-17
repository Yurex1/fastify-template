const MenuButton = ({
  onClick,
  icon,
  label,
  variant = 'default',
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between gap-4 px-3 py-2.5 
      rounded-xl group
      ${
        variant === 'danger'
          ? 'hover:bg-red-500/10 text-red-500'
          : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
      }
    `}
  >
    <span className="text-[13px] font-medium leading-none">{label}</span>
    <span className={`opacity-60 group-hover:opacity-100 group-hover:scale-[1.05] transition-opacity`}>{icon}</span>
  </button>
);

export default MenuButton;
