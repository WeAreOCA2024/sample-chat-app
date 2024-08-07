import { getProfileByPid } from "@/api";
import { ChatLog, Friend, Profile } from "@/type";
import { useEffect, useState } from "react";
import { ChatFormComponent } from "./chatform";

interface ChatLogProps {
  chatLogs: ChatLog[] | null;
  selectedFriendProfile: Profile;
  myProfile: Profile[];
  friend: Friend[];
}

export const ChatLogComponent = ({ chatLogs, selectedFriendProfile, myProfile, friend }: ChatLogProps) => {
  const [usingMyProfile, setUsingMyProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchUsingMyProfile = async () => {
      const data = friend.find((f) => f.user1_pid === selectedFriendProfile.id || f.user2_pid === selectedFriendProfile.id);
      const id = data?.user1_id === myProfile[0].id ? data?.user1_pid : data?.user2_pid;
      if (id) {
        const data = await getProfileByPid(id);
        setUsingMyProfile(data[0]);
      }
    }
    fetchUsingMyProfile();
  }, [selectedFriendProfile, myProfile, friend]);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const showChatLog = (log: ChatLog) => {
    if(log.from_pid === selectedFriendProfile.id){
      return (
        <div key={log.id} className="flex flex-col items-start">
          <div className="flex items-end gap-2">
            <div className="iconM" />
            <p className="text-white text-lg bg-neutral-700 py-2 px-4 rounded-2xl">{log.msg}</p>
            <p><small className="text-neutral-400">{formatTime(log.time)}</small></p>
          </div>
        </div>
      );
    }else{
      return (
        <div key={log.id} className="flex flex-col items-end">
          <div className="flex items-end gap-2">
            <p><small className="text-neutral-400">{formatTime(log.time)}</small></p>
            <p className="text-white text-lg bg-neutral-700 py-2 px-4 rounded-2xl">{log.msg}</p>
          </div>
        </div>
      );
    }
  }

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
      <div className="w-11/12 flex flex-col-reverse overflow-y-auto h-full gap-4">
        {chatLogs?.map((log) => (
          showChatLog(log)
        ))}
      </div>
      <ChatFormComponent myProfileId={usingMyProfile?.id} friendProfileId={selectedFriendProfile.id}/>
    </section>
  );
}