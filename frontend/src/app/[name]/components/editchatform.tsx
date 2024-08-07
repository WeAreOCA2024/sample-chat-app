import { useState, useRef, useEffect } from "react";

interface EditChatFormProps { 
  id: number | undefined; 
  text: string | undefined;
  onChangeChatLog: ({id,text}:onChangeChatLogProps) => void; 
}

interface onChangeChatLogProps { 
  id: number | undefined; 
  text: string | undefined;
}

export const EditChatFormComponent = ({ id, text, onChangeChatLog }: EditChatFormProps) => {
  const [newText, setNewText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewText(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const cursorPosition = textarea.selectionEnd;
      const currentLineNumber = textarea.value.slice(0, cursorPosition).split("\n").length;

      const visibleLines = Math.floor(textarea.clientHeight / lineHeight);
      const targetLine = Math.max(0, currentLineNumber - Math.floor(visibleLines / 2));

      textarea.scrollTop = targetLine * lineHeight;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    window.addEventListener('resize', adjustTextareaHeight);

    return () => {
      window.removeEventListener('resize', adjustTextareaHeight);
    };
  }, [text]);

  return (
    <div className="flex w-11/12 mt-6 mb-12 items-end relative">
      <div className="w-12 h-12 text-3xl bg-neutral-700 text-neutral-400 flex items-center justify-center rounded-full shrink-0">
        <p>＋</p>
      </div>
      <textarea
        ref={textareaRef}
        value={newText}
        onChange={handleChange}
        onKeyUp={adjustTextareaHeight}
        className="bg-neutral-700 outline-none text-neutral-400 w-full ml-5 pl-5 pr-24 py-4 rounded-xl resize-none relative text-lg max-h-96 min-h-12 overflow-auto"
        rows={1}
        placeholder="Change your message"
      />
      <button className="absolute p-2 h-12 w-12 bottom-2 right-2 text-2xl" onClick={() => onChangeChatLog({id, text: newText})}>📤</button>
    </div>
  );
};