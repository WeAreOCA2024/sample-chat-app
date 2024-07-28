"use client";

import { getFriendProfileByName, getMyProfileByName, getUserByName } from "@/api";
import { MyData, Profile } from "@/type";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarComponent } from "./components/sidebar";

export default function Home() {
  // get name from url
  const params = useParams();
  const name = params.name.toString();

  // use state
  const [myData, setMyData] = useState<MyData[] | null>(null);
  const [myProfile, setMyProfile] = useState<Profile[] | null>(null);
  const [friendProfile, setFriendProfile] = useState<Profile[] | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [serverMode,setServerMode] = useState<string>("dm");

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


  const handleChangeMode = (mode: string) => {
    setServerMode(mode);
  }

  // loading
  if (!myData || !myProfile || !friendProfile) {
    return <div>Loading...</div>
  }
  return (
    <main>
      <SidebarComponent onDataPass={handleChangeMode} />
    </main>
  );
}