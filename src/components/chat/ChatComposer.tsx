"use client";

import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FormValues {
  message: string;
}

export function ChatComposer({
  onSend,
  disabled,
  placeholder = "Say whatever's true right now…",
  label = "Message RESET",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { message: "" } });

  const onSubmit = handleSubmit(({ message }) => {
    onSend(message);
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full items-end gap-2">
      <div className="flex-1">
        <label htmlFor="chat-message" className="sr-only">
          {label}
        </label>
        <input
          id="chat-message"
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={errors.message ? "true" : "false"}
          className="focus-ring glass w-full rounded-full px-5 py-3.5 text-sm text-foreground placeholder:text-foreground-muted disabled:opacity-60"
          {...register("message", { required: true, maxLength: 2000 })}
        />
      </div>
      <Button
        type="submit"
        size="md"
        disabled={disabled}
        className="!rounded-full !p-3.5"
        aria-label="Send message"
      >
        <Send size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
