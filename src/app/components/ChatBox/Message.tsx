import Markdown from 'react-markdown';

export interface MessageProps {
  message: string;
  index: number;
}

const Message = ({ message, index }: MessageProps) => {
  const isUserMessage = index % 2 === 0;

  return (
    <div
      key={index}
      className={`max-w-[75%] break-words ${
        isUserMessage
          ? 'self-end bg-blue-600 text-white'
          : 'self-start bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
      } rounded-md px-3 py-1`}
    >
      <Markdown>{message}</Markdown>
    </div>
  );
};

export default Message;
