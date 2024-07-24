"use client";

import { getFriendProfileByName, getMyProfileByName, getUserByName } from "@/api";
import { MyData, Profile } from "@/type";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const params = useParams();
  const name = params.name.toString();
  const [myData, setMyData] = useState<MyData[] | null>(null);
  const [myProfile, setMyProfile] = useState<Profile[] | null>(null);
  const [FriendProfile, setFriendProfile] = useState<Profile[] | null>(null);

  useEffect(() => {
    const fetchMyData = async () => {
      const data = await getUserByName(name);
      setMyData(data);
    }
    const fetchMyProfile = async () => {
      const data = await getMyProfileByName(name);
      setMyProfile(data);
    }
    const fetchFriendProfile = async () => {
      const data = await getFriendProfileByName(name);
      setFriendProfile(data);
    }
    fetchMyProfile();
    fetchMyData();
    fetchFriendProfile();
  }, [name]);
  return (
    <main>
    </main>
  );
}