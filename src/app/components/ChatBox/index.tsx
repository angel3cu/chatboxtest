import { useEffect, useRef, useState } from 'react';
import Message from './Message';
import Prompt from './Prompt';

export interface ChatBoxProps {
  messages: string[];
  setMessages: (messages: string[]) => void;
  send: (message: string) => Promise<void>;
}

const ChatBox = ({ messages, setMessages, send }: ChatBoxProps) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  const onSend = () => {
    if (!input.trim()) {
      return;
    }

    const newMessage = input.trim();
    setMessages([...messages, newMessage]);
    setInput('');

    send(newMessage);
  };

  return (
    <div className="fixed bottom-6 right-6 w-md h-2/3 flex flex-col rounded-lg shadow-lg border bg-white dark:bg-gray-900">
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
        {messages.map((message, index) => (
          <Message key={index} message={message} index={index} />
        ))}
        <div ref={endRef} />
      </div>
      <Prompt input={input} setInput={setInput} onSend={onSend} />
    </div>
  );
};

export default ChatBox;
