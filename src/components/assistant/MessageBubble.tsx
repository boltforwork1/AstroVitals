import { Bot } from 'lucide-react';
import type { ChatMessage } from '@/hooks/useAssistantChat';
import { parseBlocks, parseInline } from '@/utils/formatMessage';

function InlineText({ text }: { text: string }) {
  const parts = parseInline(text);
  return (
    <>
      {parts.map((part, i) =>
        part.type === 'bold' ? (
          <strong key={i} className="font-semibold">
            {part.content}
          </strong>
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const blocks = parseBlocks(message.content);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/20 shrink-0 mt-1">
          <Bot className="w-4 h-4 text-accent" />
        </div>
      )}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent text-space-bg rounded-tr-sm'
              : 'bg-space-surface border border-space-border text-space-text rounded-tl-sm'
          }`}
        >
          {blocks.map((block, i) =>
            block.type === 'list' ? (
              <ul key={i} className="list-none space-y-1 my-1">
                {block.items?.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-accent shrink-0">-</span>
                    <span>
                      <InlineText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p key={i} className="my-0.5">
                <InlineText text={block.text ?? ''} />
              </p>
            )
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] text-space-muted tabular-nums">{time}</span>
          {message.offline && (
            <span className="text-[10px] text-space-muted italic">
              Offline demo mode: answer generated locally
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
