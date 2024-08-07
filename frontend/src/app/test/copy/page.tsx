"use client"
import React from 'react';

const CopyButton = () => {
  const text = 'コピーしたいテキストです';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('コピーしました!');
    } catch (err) {
      console.error('コピーに失敗しました', err);
    }
  };

  return (
    <div>
      <p>{text}</p>
      <button onClick={handleCopy}>コピー</button>
    </div>
  );
};


export default function HomePage() {
  return (
    <div>
      <h1>テキストコピー機能</h1>
      <CopyButton />
    </div>
  );
}