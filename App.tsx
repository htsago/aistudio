
import React, { useState, useRef, useEffect } from 'react';
import Message from './components/Message';
import MessageInput from './components/MessageInput';
import { BotIcon } from './components/icons';
import { type Message as MessageType } from './types';
import { runChat } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'initial',
      role: 'model',
      text: "Hello! I'm ShopBot, your AI shopping assistant. How can I help you today? You can ask me to find products, check your order status, and more!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    setIsLoading(true);

    const newMessages = await runChat(messages, text);
    
    setMessages(prevMessages => [...prevMessages, ...newMessages]);
    setIsLoading(false);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center gap-3 shadow-lg z-10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500">
            <BotIcon />
        </div>
        <div>
            <h1 className="text-xl font-bold">ShopBot</h1>
            <p className="text-sm text-gray-400">Your AI Shopping Assistant</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isLoading && (
               <div className="flex items-start gap-3 my-4 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-teal-500">
                      <BotIcon />
                    </div>
                    <div className="max-w-md lg:max-w-2xl rounded-lg p-3 bg-gray-700 rounded-bl-none">
                       <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                       </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </main>

      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
