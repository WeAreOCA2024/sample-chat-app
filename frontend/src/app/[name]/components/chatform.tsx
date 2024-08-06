import { useState, useRef, useEffect } from "react";

export const ChatFormComponent = () => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      const cursorPosition = textareaRef.current.selectionEnd;
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const visibleHeight = textareaRef.current.clientHeight;
      const scrollHeight = textareaRef.current.scrollHeight;
      const cursorY = Math.floor(cursorPosition / textareaRef.current.cols) * lineHeight;

      const targetScroll = cursorY - (visibleHeight / 2) + (lineHeight / 4);
      textareaRef.current.scrollTop = Math.min(scrollHeight, targetScroll);
    }
  };

  return (
    <div className="flex w-11/12 mt-6 mb-12 items-end relative">
      <div className="w-12 h-12 text-3xl bg-neutral-700 text-neutral-400 flex items-center justify-center rounded-full shrink-0">
        <p>＋</p>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="bg-neutral-700 outline-none text-neutral-400 w-full ml-5 pl-5 pr-24 py-4 rounded-xl resize-none relative text-lg max-h-96 min-h-12 overflow-auto"
        rows={1}
        placeholder="Type a message.."
      />
      <button className="absolute p-2 h-12 w-12 bottom-2 right-2 text-2xl">📤</button>
    </div>
  );
};