'use client';

import { useState, useRef, useEffect } from 'react';
import ChatBox from './components/ChatBox';
import { v7 as uuid } from 'uuid';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique user ID on page load.
    setUserId(uuid());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  async function send(message: string) {
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    if (!response.body) {
      return;
    }

    if (response.status !== 200) {
      const error = await response.text();

      setMessages((prev) => [...prev, `Error: ${error}`]);
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
