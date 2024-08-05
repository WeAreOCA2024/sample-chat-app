"use client";

import { getChatLogByMyIdAndFriendProfileId, getFriendProfileByName, getFriendProfileByProfileId, getMyProfileByName, getUserByName } from "@/api";
import { ChatLog, Friend, MyData, Profile } from "@/type";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarComponent } from "./components/sidebar";
import { MyStatusComponent } from "./components/mystatus";
import { ShowFriendComponent } from "./components/showfriend";

export default function Home() {
  // get name from url
  const params = useParams();
  const name = params.name.toString();

  // use state
  const [myData, setMyData] = useState<MyData[] | null>(null);
  const [myProfile, setMyProfile] = useState<Profile[] | null>(null);
  const [friendProfile, setFriendProfile] = useState<Friend[] | null>(null);
  const [serverMode,setServerMode] = useState<string>("dm");
  const [selectedMyProfile, setSelectedMyProfile] = useState<string>(name);
  const [selectedFriendProfileId, setSelectedFriendProfileId] = useState<number | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatLog[] | null>(null);

  // use effect
  useEffect(() => {
    const fetchData = async () => {
      const myData = await getUserByName(name);
      const myProfile = await getMyProfileByName(name);
      const friendProfile = await getFriendProfileByName(name);
      setMyData(myData);
      setMyProfile(myProfile);
      setFriendProfile(friendProfile);
    }
    fetchData();
  }, [name]);

  // handle
  const handleChangeMode = (mode: string) => {
    setServerMode(mode);
  }
  const handleChangeMyProfile = async (newName: string) => {
    setSelectedMyProfile(newName);
    if(name == newName){
      const friendProfile = await getFriendProfileByName(name);
      setFriendProfile(friendProfile);
      return;
    }
    const id = myProfile?.find((profile) => profile.name === newName)?.id;
    if (id) {
      const friendProfile = await getFriendProfileByProfileId(id.toString());
      if (friendProfile) {
        if(friendProfile.find((profile) => profile.user1_id != selectedFriendProfileId || profile.user2_id != selectedFriendProfileId)){
          setSelectedFriendProfileId(null);
        }
        setFriendProfile(friendProfile);
      }else{
        setFriendProfile([]);
        setSelectedFriendProfileId(null);
      }
    }
  }
  const handleChangeSelectedFriend = async (id: number) => {
    setSelectedFriendProfileId(id);
    if (!myProfile) {
      return;
    }
    console.log(myProfile[0].id.toString(), id.toString());
    const chatLogs = await getChatLogByMyIdAndFriendProfileId(myProfile[0].id.toString(), id.toString());
    setChatLogs(chatLogs);
    console.log(chatLogs);
  }

  // loading
  if (!myData || !myProfile || !friendProfile) {
    return <div>Loading...</div>
  }
  return (
    <main className="flex">
      <SidebarComponent onDataPass={handleChangeMode} />
      <section className="w-96 px-4 bg-neutral-800 h-screen">
        <MyStatusComponent myProfile={myProfile} selectedProfileName={selectedMyProfile} onChangeMyProfile={handleChangeMyProfile} />
        {
          serverMode === "dm" ? (
            <ShowFriendComponent friendProfile={friendProfile} myProfile={myProfile} handleChangeSelectedFriend={handleChangeSelectedFriend} />
          ) : (
            <div>
              <p>Group Chat</p>
            </div>  
          )
        }
      </section>
    </main>
  );
}