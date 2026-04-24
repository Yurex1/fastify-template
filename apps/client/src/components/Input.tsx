type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2.5
        text-white placeholder:text-neutral-500 outline-none focus:border-white transition"
    />
  );
};
