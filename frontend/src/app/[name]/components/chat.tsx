import { deleteChatLog, getProfileByPid, putChatLog } from "@/api";
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
  const [usingMyProfile, setUsingMyProfile] = useState<Profile | null>(null);
  const [editChatLogId, setEditChatLogId] = useState<number | null>(null);
  const [ChatOption, setChatOption] = useState<string | null>(null);
  const [editChatLog, setEditChatLog] = useState<ChatLog | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

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

  // 外部クリックでメニューを閉じる処理
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

  const handleExecEditOption = (mode: string, log: ChatLog) => {
    setChatOption(mode);
    if (editChatLogId == null) {
      return;
    }
    if (mode === "編集") {
      setEditChatLog(log);
    } else if (mode === "完全に削除") {
      deleteChatLog(editChatLogId);
    } else if (mode === "削除") {
      alert("未実装");
    } else if (mode === "コピー") {
      handleCopyText(log.msg);
    } else if (mode === "リアクション") {
      alert("未実装");
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

  const showChatLog = (log: ChatLog) => {
    const formattedMessage = log.msg.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));

    if (log.from_pid === selectedFriendProfile.id) {
      return (
        <div key={log.id} className="flex justify-start" onContextMenu={(event) => handleEditChatLog(log, event)}>
          <div className="flex items-end gap-2">
            <div className="iconM" />
            <p className="text-white text-lg bg-neutral-700 py-2 px-4 rounded-2xl">{formattedMessage}</p>
            <p>
              <small className="text-neutral-400">{formatTime(log.time)}</small>
            </p>
          </div>
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
              <p className="text-white text-lg bg-neutral-700 py-2 px-4 rounded-2xl">{formattedMessage}</p>
            </div>
          </div>
          {editChatLogId === log.id && menuPosition && (
            <div
              className="flex flex-col items-start mt-4"
              style={{ position: "absolute", left: menuPosition.x, top: menuPosition.y }} // メニューの位置を設定
            >
              <div className="w-52 text-white text-sm bg-neutral-700 rounded-md border-2 border-neutral-400">
                {editOption("編集", log)}
                {editOption("完全に削除", log)}
                {editOption("自分のチャットから削除", log)}
                {editOption("コピー", log)}
                {editOption("リアクション", log)}
                {editOption("スレッド", log)}
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
  );
};