import { deleteChatLog, deleteChatlogFromMyScreen, getProfileByPid, putChatLog, putReaction, restoreChatlogFromMyScreen } from "@/api";
import { ChatLog, Friend, Profile } from "@/type";
import { useEffect, useState } from "react";
import { ChatFormComponent } from "./chatform";
import { EditChatFormComponent } from "./editchatform";

interface ChatLogProps {
  chatLogs: ChatLog[] | null;
  selectedFriendProfile: Profile;
  myProfile: Profile[];
  friend: Friend[];
}

interface onChangeChatLogProps {
  id: number | undefined;
  text: string | undefined;
}

export const ChatLogComponent = ({ chatLogs, selectedFriendProfile, myProfile, friend }: ChatLogProps) => {
  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😠"];
  const [usingMyProfile, setUsingMyProfile] = useState<Profile | null>(null);
  const [editChatLogId, setEditChatLogId] = useState<number | null>(null);
  const [ChatOption, setChatOption] = useState<string | null>(null);
  const [editChatLog, setEditChatLog] = useState<ChatLog | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [isReactionId, setisReactionId] = useState<number|null>(null);
  
  useEffect(() => {
    const fetchUsingMyProfile = async () => {
      const data = friend.find((f) => f.user1_pid === selectedFriendProfile.id || f.user2_pid === selectedFriendProfile.id);
      const id = data?.user1_id === myProfile[0].id ? data?.user1_pid : data?.user2_pid;
      if (id) {
        const data = await getProfileByPid(id);
        setUsingMyProfile(data[0]);
      }
    };
    fetchUsingMyProfile();
  }, [selectedFriendProfile, myProfile, friend]);

  useEffect(() => {
    const handleClickOutside = () => {
      setEditChatLogId(null);
      setMenuPosition(null);
    };

    if (menuPosition) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuPosition]);

  const handleEditChatLog = (log: ChatLog, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditChatLogId(log.id);
    setChatOption(null);
    setMenuPosition({ x: event.clientX - 104, y: event.clientY });
  };

  const handleAddReaction = (id:number,reaction: string) => { 
    putReaction(id,reaction,usingMyProfile?.id);
    setisReactionId(null);
  }
  const onChangeChatLog = ({ id, text }: onChangeChatLogProps) => {
    setEditChatLog(null);
    setChatOption(null);
    if (id && text) {
      putChatLog(id, text);
    }
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('コピーに失敗しました', err);
    }
  };

  const handleExecEditOption = async (mode: string, log: ChatLog) => {
    setChatOption(mode);
    if (editChatLogId == null) {
      return;
    }
    if (mode === "編集") {
      setEditChatLog(log);
    } else if (mode === "完全に削除") {
      await deleteChatLog(editChatLogId);
    } else if (mode === "自分のチャットから削除") {
      await deleteChatlogFromMyScreen(editChatLogId, usingMyProfile?.id, log.from_pid);
    }else if(mode == "メッセージの復元"){
      await restoreChatlogFromMyScreen(editChatLogId,usingMyProfile?.id,log.from_pid);
    } else if (mode === "コピー") {
      handleCopyText(log.msg);
    } else if (mode === "リアクション") {
      setisReactionId(log.id);
    } else if (mode === "スレッド") {
      alert("未実装");
    }
    setEditChatLogId(null);
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const editOption = (content: string, log: ChatLog) => {
    return (
      <p className="hover:bg-neutral-500 px-3 py-2 transition-colors" onClick={() => handleExecEditOption(content, log)}>
        {content}
      </p>
    );
  };

  const ReactionSelector = (id:number,isMine:boolean,reaction:string) => {
    return (
      <div className={`flex gap-2 mt-1 ${isMine ? "justify-end" : "justify-start"}`}> 
        {reactionEmojis.map((emoji, index) => (
          <p key={index} className={`text-xl  rounded-sm w-7 h-7 flex justify-center items-center cursor-pointer transition-colors ${reaction == emoji ? "bg-green-600 hover:bg-green-700" : "hover:bg-neutral-700"}`} onClick={() => handleAddReaction(id,emoji)}>
            {emoji}
          </p>
        ))}
      </div>
    );
  };

  const showReaction = (from_reaction : string | null,to_reaction : string | null, isMyMessage : boolean) => {
    return (
      (from_reaction || to_reaction )&& (
        <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
          {from_reaction == to_reaction ? (
            <div className="pr-3 text-xl">
              <p className="flex items-start gap-1">{from_reaction}<span className="text-white text-xs">2</span></p>
            </div>
            ):(
              <div className="flex min-w-8 py-1 pr-3 gap-1 text-xl">
                <p>{from_reaction}</p>
                <p>{to_reaction}</p>
              </div>
            )
          }
        </div>
      )
    )
  }

  const showChatLog = (log: ChatLog) => {
    let isDeleted = false;
    const formattedMessage = log.msg.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));

    if(log.from_pid === usingMyProfile?.id){
      if(log.delete_from){
        isDeleted = true;
      }
    }else{
      if(log.delete_to){
        isDeleted = true;
      }
    }

    if (log.from_pid === selectedFriendProfile.id) {
      return (
        <div key={log.id}>
          <div className="flex justify-start gap-2" onContextMenu={(event) => handleEditChatLog(log, event)}>
            <div className="iconM"/>
            <div className="flex items-end gap-2">
              <p className={`text-white text-lg ${isDeleted ? null : "bg-neutral-700"} py-2 px-4 rounded-2xl`}>{isDeleted ? "削除した文章です": formattedMessage}</p>
              <div className="text-white flex flex-col items-start">
                {editChatLogId === log.id && <p className="text-xs">編集中</p>}
                <p className="text-neutral-400 text-sm">{formatTime(log.time)}</p>
              </div>
            </div>
          </div>
          <div>
            {isReactionId === log.id ? ReactionSelector(log.id,false,log.to_reaction) : showReaction(log.from_reaction,log.to_reaction, false)}
          </div>
          {editChatLogId === log.id && menuPosition && (
            <div
              className="flex flex-col items-start mt-4 z-10"
              style={{ position: "absolute", left: menuPosition.x, top: menuPosition.y }}>
              <div className="w-52 text-white text-sm bg-neutral-700 rounded-md border-2 border-neutral-400">
                {isDeleted ? editOption("メッセージの復元",log) : editOption("自分のチャットから削除", log)}
                {!isDeleted && editOption("コピー", log)}
                {editOption("リアクション", log)}
                {editOption("キャンセル", log)}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={log.id}>
          <div className="flex justify-end" onContextMenu={(event) => handleEditChatLog(log, event)}>
            <div className="flex items-end gap-2">
              <div className="text-white flex flex-col items-end">
                {editChatLogId === log.id && <p className="text-xs">編集中</p>}
                <p className="text-neutral-400 text-sm">{formatTime(log.time)}</p>
              </div>
              <p className={`text-white text-lg ${isDeleted ? null : "bg-neutral-700"} py-2 px-4 rounded-2xl`}>{isDeleted ? "削除した文章です": formattedMessage}</p>
            </div>
          </div>
          <div>
            {isReactionId === log.id ? ReactionSelector(log.id,true,log.from_reaction) : showReaction(log.from_reaction,log.to_reaction, true)}
          </div>
          {editChatLogId === log.id && menuPosition && (
            <div
              className="flex flex-col items-start mt-4 z-10"
              style={{ position: "absolute", left: menuPosition.x, top: menuPosition.y }}
            >
              <div className="w-52 text-white text-sm bg-neutral-700 rounded-md border-2 border-neutral-400">
                {editOption("編集", log)}
                {editOption("完全に削除", log)}
                {isDeleted ? editOption("メッセージの復元",log) : editOption("自分のチャットから削除", log)}
                {editOption("コピー", log)}
                {editOption("リアクション", log)}
                {editOption("キャンセル", log)}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <section className="flex flex-col items-center h-screen pt-3">
      <div className="w-11/12 min-h-20 flex items-center border-b-2 border-white justify-between">
        <div className="flex items-center">
          <div className="iconL" />
          <p className="text-white text-4xl ml-3">{selectedFriendProfile?.name}</p>
        </div>
        <div className="flex items-center text-white text-3xl gap-4">
          <p onClick={() => alert("未実装")}>☎️</p>
          <p>三</p>
        </div>
      </div>
      <div className="w-full px-[calc(100%/24)] pt-3 flex flex-col-reverse overflow-y-auto h-full gap-4">
        {chatLogs?.map((log) => showChatLog(log))}
      </div>
      {ChatOption === "編集" ? (
        <EditChatFormComponent id={editChatLog?.id} text={editChatLog?.msg} onChangeChatLog={onChangeChatLog} />
      ) : (
        <ChatFormComponent myProfileId={usingMyProfile?.id} friendProfileId={selectedFriendProfile.id} />
      )}
    </section>
  )
}