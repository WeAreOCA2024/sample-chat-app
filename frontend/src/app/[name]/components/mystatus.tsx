"use client";
import { Profile } from "@/type";
import { useState } from "react";

interface ParamProps {
  myProfile: Profile[];
  selectedProfileName: string;
  onChangeMyProfile:(data:string) => void;
}

export const MyStatusComponent = ({myProfile,selectedProfileName,onChangeMyProfile}:ParamProps) => {
  const profileColorPattern = ["green", "blue", "orange", "yellow"];
  let colorIndex = 0;
  const [selectedMyProfile, setSelectedMyProfile] = useState<string>(selectedProfileName);
  const handleChangeMyProfile = (name: string) => {
    if(name == selectedMyProfile){
      return
    }
    onChangeMyProfile(name);
    setSelectedMyProfile(name);
  }
  const showProfile = (id: number, name: string) => {
    const colorClass = `bg-${profileColorPattern[colorIndex % profileColorPattern.length]}-300`;
    colorIndex++;
    return (
      <div
          key={id} 
          className={`w-16 h-16 ${colorClass} rounded-xl bg-opacity-70 flex justify-center items-center box-border ${name == selectedMyProfile ? "border-2 border-white" : null}`}
          onClick={() => handleChangeMyProfile(name)}
        >
        <div className="iconM" />
      </div>
    );
  }
  return (
    <section>
      <div className="h-16 my-4 px-4 flex items-center gap-4 bg-blue-500 rounded-xl">
        <div className="iconL px-4" />
        <p className="text-white h-max text-2xl">{selectedMyProfile}</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-5">
        {myProfile?.map((profile) => (
          showProfile(profile.id, profile.name)
        ))}
      </div>
    </section>
  );
}