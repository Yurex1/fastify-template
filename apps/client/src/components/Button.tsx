type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
};

export const Button = ({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-xl bg-white text-black font-medium py-2.5 transition hover:bg-neutral-200
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};
