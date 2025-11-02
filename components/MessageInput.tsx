
import React, { useState } from 'react';
import { SendIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "ShopBot is thinking..." : "Ask me anything about our products..."}
          disabled={isLoading}
          className="w-full bg-gray-700 text-white border border-gray-600 rounded-full py-3 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white rounded-full p-2.5 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
