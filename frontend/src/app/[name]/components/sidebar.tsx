"use client";

import { useState } from "react";

export const SidebarComponent = ({onDataPass}:{onDataPass:(data:string) => void}) => {
  const [mode, setMode] = useState<string>("dm");
  const sendMode = async (mode:string) => {
    onDataPass(mode)
    setMode(mode)
  }
  const content = (modeName:string, icon:string) => {
    return(
      <p onClick={() => sendMode(modeName)} className={`text-3xl border border-gray-400 w-12 h-12 items-center flex justify-center rounded-2xl transition-colors ${modeName == mode ? ("bg-gray-200 text-black") : ("text-white")}`}>{icon}</p>
    )
  }

  return (
    <section className="bg-neutral-900 w-20 h-screen py-5 flex flex-col items-center gap-3">
      {content("dm", "💬")}
      {content("server", "👥")}
      {content("notice", "🔔")}
      {content("addserver", "＋")}
      <div className="border-b-2 w-2/3"></div>
    </section>
  )
}