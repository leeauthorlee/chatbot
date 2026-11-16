"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  { icon: "☀", text: "오늘 날씨에 어울리는 커피" },
  { icon: "❄", text: "달콤하고 시원한 음료 추천해 줘" },
  { icon: "◒", text: "산미 적은 원두를 찾고 있어" },
];

function LeafMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`leaf-mark${small ? " leaf-mark-small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M25.6 5.8C15.2 5.4 7 9.4 7 17.3c0 4.3 3 7.2 7 7.2 8.8 0 11.4-9.8 11.6-18.7Z" fill="currentColor" />
        <path d="M7.2 26c3.1-5.4 7.5-9.6 13.3-12.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "답변을 불러오지 못했어요.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
      setMessages([...nextMessages, { role: "assistant", content: message }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  function startNewChat() {
    if (isLoading) return;
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Green Cup 홈">
          <LeafMark />
          <span>green cup<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="online-status"><span /> 커피 친구 온라인</span>
          <button className="new-chat-button" type="button" onClick={startNewChat}>
            <span aria-hidden="true">＋</span> 새 대화
          </button>
        </div>
      </header>

      <div className="workspace" id="home">
        <aside className="side-panel">
          <div className="side-intro">
            <div className="cup-illustration" aria-hidden="true">
              <span className="steam steam-one" /><span className="steam steam-two" />
              <div className="cup"><LeafMark small /></div>
              <div className="cup-saucer" />
            </div>
            <p className="eyebrow">A LITTLE MOMENT FOR YOU</p>
            <h1>커피 한 잔의<br />여유를 찾아보세요.</h1>
            <p className="side-copy">기분과 취향을 들려주시면<br />딱 맞는 한 잔을 함께 골라드릴게요.</p>
          </div>
          <div className="side-note">
            <span className="note-icon" aria-hidden="true">✳</span>
            <p>취향은 다 다르니까,<br /><strong>추천도 당신답게.</strong></p>
          </div>
          <p className="side-footer">MADE FOR SLOW MORNINGS</p>
        </aside>

        <section className="chat-panel" aria-label="커피 챗봇 대화">
          <div className="chat-heading">
            <div className="bot-avatar"><LeafMark small /></div>
            <div>
              <h2>오늘의 커피 큐레이터</h2>
              <p>취향을 듣고, 한 잔을 추천해 드려요</p>
            </div>
            <button className="mobile-reset" type="button" onClick={startNewChat} aria-label="새 대화 시작">↻</button>
          </div>

          <div className="conversation" ref={scrollRef} aria-live="polite">
            <div className="date-divider"><span>오늘</span></div>
            <div className="message-row assistant-row">
              <div className="message-avatar"><LeafMark small /></div>
              <div className="message-content">
                <span className="sender-label">GREEN CUP</span>
                <div className="bubble assistant-bubble">
                  안녕하세요! 오늘은 어떤 커피가 끌리세요? ☕<br />
                  좋아하는 맛이나 지금 기분을 알려주시면 취향에 꼭 맞는 한 잔을 찾아드릴게요.
                </div>
                {messages.length === 0 && (
                  <div className="suggestion-list" aria-label="추천 질문">
                    {suggestions.map((suggestion) => (
                      <button className="suggestion-chip" key={suggestion.text} onClick={() => void sendMessage(suggestion.text)} type="button">
                        <span aria-hidden="true">{suggestion.icon}</span>{suggestion.text}<span className="chip-arrow" aria-hidden="true">↗</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {messages.map((message, index) => (
              <div className={`message-row ${message.role === "user" ? "user-row" : "assistant-row"}`} key={`${index}-${message.role}`}>
                {message.role === "assistant" && <div className="message-avatar"><LeafMark small /></div>}
                <div className="message-content">
                  {message.role === "assistant" && <span className="sender-label">GREEN CUP</span>}
                  <div className={`bubble ${message.role === "user" ? "user-bubble" : "assistant-bubble"}`}>
                    {message.content.split("\n").map((line, lineIndex) => <span key={lineIndex}>{line}{lineIndex < message.content.split("\n").length - 1 && <br />}</span>)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-row assistant-row">
                <div className="message-avatar"><LeafMark small /></div>
                <div className="typing-bubble" aria-label="답변 작성 중"><i /><i /><i /></div>
              </div>
            )}
          </div>

          <div className="composer-wrap">
            <form className="composer" onSubmit={handleSubmit}>
              <textarea
                ref={inputRef}
                aria-label="메시지 입력"
                placeholder="궁금한 점이나 좋아하는 맛을 알려주세요..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
              />
              <div className="composer-bottom">
                <span className="composer-hint"><span>↵</span> 전송 <span className="hint-divider">·</span> Shift + ↵ 줄바꿈</span>
                <button className="send-button" type="submit" disabled={!input.trim() || isLoading} aria-label="메시지 보내기">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m0 0L6.5 10.5M12 5l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </form>
            <p className="disclaimer">Green Cup은 AI 커피 큐레이터예요. 중요한 정보는 한 번 더 확인해 주세요.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
