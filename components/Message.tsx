
import React from 'react';
import { type Message as MessageType, type Product } from '../types';
import { UserIcon, BotIcon } from './icons';
import ProductCard from './ProductCard';
import { type FunctionCall } from '@google/genai';

interface MessageProps {
  message: MessageType;
}

const ToolCallDisplay: React.FC<{ toolCalls: FunctionCall[] }> = ({ toolCalls }) => (
    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 my-2">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Thinking... Calling tools:</h4>
        <ul className="space-y-1">
            {toolCalls.map((call, index) => (
                <li key={index} className="text-xs text-gray-400 font-mono bg-gray-800/60 p-2 rounded-md">
                    <span className="font-bold text-indigo-400">{call.name}</span>
                    <span className="text-gray-500">({JSON.stringify(call.args)})</span>
                </li>
            ))}
        </ul>
    </div>
);

const MessageContent: React.FC<{ message: MessageType }> = ({ message }) => {
    if (message.text) {
        return <p className="text-white whitespace-pre-wrap">{message.text}</p>;
    }

    if (message.toolCalls) {
        return <ToolCallDisplay toolCalls={message.toolCalls} />;
    }
    
    if (message.toolResult?.name === 'search_products' && Array.isArray(message.toolResult.result)) {
        const products = message.toolResult.result as Product[];
        return (
             <div className="mt-2">
                <p className="text-sm text-gray-400 mb-2">Found these products:</p>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </div>
        );
    }
    
    if (message.toolResult) {
         return (
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 my-2">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Tool Result: <span className="font-mono text-indigo-400">{message.toolResult.name}</span></h4>
                <pre className="text-xs text-gray-400 font-mono bg-gray-800/60 p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(message.toolResult.result, null, 2)}
                </pre>
            </div>
        );
    }

    return null;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  const avatar = isUser ? <UserIcon /> : <BotIcon />;
  const avatarBg = isUser ? 'bg-indigo-500' : 'bg-teal-500';

  if(isTool){
    return <MessageContent message={message} />;
  }

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${avatarBg}`}>
          {avatar}
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-2xl rounded-lg p-3 ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-700 text-white rounded-bl-none'
        }`}
      >
        <MessageContent message={message} />
      </div>
      {isUser && (
         <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${avatarBg}`}>
          {avatar}
        </div>
      )}
    </div>
  );
};

export default Message;
