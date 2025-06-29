'use client';

import { useState, useRef, useEffect } from 'react';
import { v7 as uuid } from 'uuid';

import ChatBox from './components/ChatBox';
import Preferences, { PreferencesProps } from './components/Preferences';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [properties, setProperties] = useState<PreferencesProps>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique user ID on page load.
    setUserId(uuid());
  }, []);

  useEffect(() => {
    fetchProperties();
    endRef.current?.scrollIntoView();
  }, [Math.floor(messages.length / 2)]);

  async function fetchProperties() {
    if (!userId) {
      return;
    }

    const response = await fetch(`/api/preferences?userId=${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!(response.ok && response.body)) {
      return;
    }

    setProperties(await response.json());
  }

  async function send(message: string) {
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    if (!response.body) {
      return;
    }

    if (!response.ok) {
      const error = await response.text();

      setMessages((prev) => [...prev, `Error: ${error}`]);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let ai = '';
    setMessages((prev) => [...prev, '']);

    for (let { value, done } = await reader.read(); !done; { value, done } = await reader.read()) {
      if (!value) {
        continue;
      }

      ai += decoder.decode(value);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = ai;
        return copy;
      });
    }
  }

  return (
    <>
      <Preferences {...properties} />
      <ChatBox messages={messages} setMessages={setMessages} send={send} />
    </>
  );
}
