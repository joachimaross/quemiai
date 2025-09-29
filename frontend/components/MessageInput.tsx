import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (msg: string) => void;
  placeholder?: string;
}

export default function MessageInput({ onSend, placeholder }: MessageInputProps) {
  const [value, setValue] = useState('');
  return (
    <form
      className="flex items-center w-full p-2 bg-bg rounded-xl border border-accent mt-2"
      onSubmit={e => {
        e.preventDefault();
        if (value.trim()) {
          onSend(value);
          setValue('');
        }
      }}
    >
      <input
        className="flex-1 bg-transparent outline-none text-white px-2"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder || 'Type a message...'}
      />
      <button type="submit" className="ml-2 px-4 py-1 rounded-lg bg-primary text-black font-bold shadow hover:bg-accent transition">
        Send
      </button>
    </form>
  );
}
