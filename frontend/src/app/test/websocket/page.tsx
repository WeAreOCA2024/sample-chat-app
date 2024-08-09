"use client";
import { useEffect, useState } from "react";



export default function WebsocketPage(){
  const [conn,setConn] = useState("Loading...");
  const ws = async() => {
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.onopen = () => {
      console.log('connected');
      setConn('connected');
      ws.send('Hello Server!');
    };
    ws.onmessage = (e) => {
      console.log(e.data);
    };
    ws.onclose = () => {
      console.log('disconnected');
    };
    ws.onerror = (e) => {
      console.log(e);
    };
  }
  useEffect(() => {
    ws();
  });
  return (
    <div>
      <h1>Websocket</h1>
      <p>{conn}</p>
    </div>
  )
}