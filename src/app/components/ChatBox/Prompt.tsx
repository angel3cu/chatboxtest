export interface PromptProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
}

const Prompt = ({ input, setInput, onSend }: PromptProps) => {
  return (
    <div className="p-3 flex gap-2 w-sm">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        className="flex-1 rounded-md border px-2 py-1 text-sm bg-transparent outline-none"
        placeholder="Type a message"
      />
      <button onClick={onSend} className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
        Send
      </button>
    </div>
  );
};

export default Prompt;
