"use client"

import { useAppContext } from "../contexts/AppContext";

export const Btn = () => {
  const { count, setCount } = useAppContext();
  
  const handleClick = () => {
    setCount(count + 1);
  }
  
  return (
    <div>
      <h3>{count}</h3>
      <button onClick={handleClick}>+</button>
    </div>
  );
}