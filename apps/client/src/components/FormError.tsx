export function FormError({ message }: { message: Error | null }) {
  if (!message) return null;

  return <p className="text-sm text-red-400 text-center min-h-[1.25rem]">{message.message}</p>;
}
