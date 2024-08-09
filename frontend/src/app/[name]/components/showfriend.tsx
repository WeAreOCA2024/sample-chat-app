import { useEffect, useState } from "react";
import { getProfileByPid } from "@/api";
import { Friend, Profile } from "@/type";

interface FriendProps {
  friendProfile: Friend[];
  myProfile: Profile[];
  selectedFriendProfileId: number | null;
  handleChangeSelectedFriend: (id: number) => void;
}

export const ShowFriendComponent = ({ friendProfile, myProfile,selectedFriendProfileId,handleChangeSelectedFriend }: FriendProps) => {
  const [friendProfiles, setFriendProfiles] = useState<Profile[]>([]);

  const ShowFriend = (id: number, name: string) => {
    return (
      <div key={id} className={`flex items-center pl-3 py-3 rounded-2xl transition-colors gap-4 ${id == selectedFriendProfileId ? "bg-neutral-600" : null}`} onClick={ () => handleChangeSelectedFriend(id)}>
        <div className="iconM" />
        <p className="text-xl text-neutral-300">{name}</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchProfiles = async () => {
      const profiles = await Promise.all(
        friendProfile.map(async (friend) => {
          const id = friend.user1_id === myProfile[0].id ? friend.user2_pid : friend.user1_pid;
          const data = await getProfileByPid(id);
          return data[0];
        })
      );
      setFriendProfiles(profiles);
    };
    fetchProfiles();
  }, [friendProfile, myProfile]);

  return (
    <div className="flex flex-col gap-1">
      {friendProfiles?.map((profile) => (
        ShowFriend(profile.id, profile.name)
      ))}
    </div>
  );
};