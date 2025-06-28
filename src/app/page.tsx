'use client';
import { useState, useRef, useEffect } from 'react';
import ChatBox from './components/ChatBox';

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  async function send(message: string) {
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.body) {
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let ai = '';
    setMessages((prev) => [...prev, '']);

    for (let { value, done } = await reader.read(); !done; { value, done } = await reader.read()) {
      ai += decoder.decode(value);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = ai;
        return copy;
      });
    }
  }

  return <ChatBox messages={messages} setMessages={setMessages} send={send} />;
}
