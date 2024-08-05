"use client";
import { useEffect, useState } from "react";
import { getProfileByPid } from "@/api";
import { Friend, Profile } from "@/type";

interface FriendProps {
  friendProfile: Friend[];
  myProfile: Profile[];
  handleChangeSelectedFriend: (id: number) => void;
}

export const ShowFriendComponent = ({ friendProfile, myProfile,handleChangeSelectedFriend }: FriendProps) => {
  const [friendProfiles, setFriendProfiles] = useState<Profile[]>([]);

  const ShowFriend = (id: number, name: string) => {
    return (
      <div key={id} className="flex items-center gap-4" onClick={ () => handleChangeSelectedFriend(id)}>
        <div className="iconM" />
        <p className="text-xl text-neutral-300">{name}</p>
      </div>
    );
  }


  useEffect(() => {
    const fetchProfiles = async () => {
      const profiles = await Promise.all(
        friendProfile.map(async (friend) => {
          const id = friend.user1_id === myProfile[0].id ? friend.user2_id : friend.user1_id;
          const data = await getProfileByPid(id);
          return data[0];
        })
      );
      setFriendProfiles(profiles);
    };
    fetchProfiles();
  }, [friendProfile, myProfile]);

  return (
    <div className="flex flex-col gap-4">
      {friendProfiles?.map((profile) => (
        ShowFriend(profile.id, profile.name)
      ))}
    </div>
  );
};