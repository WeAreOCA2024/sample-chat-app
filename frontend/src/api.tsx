import { ChatLog, Friend, MyData, Profile } from "./type";

// get user by my name
export const getUserByName = async (name: string):Promise<MyData[]> => {
  const res = await fetch(`http://localhost:8080/get/user/${name}`);
  const data = await res.json();
  return data;
}

// get my profile by my name
export const getMyProfileByName = async (name: string):Promise<Profile[]> => {
  const res = await fetch(`http://localhost:8080/get/profile/${name}`);
  const data = await res.json();
  return data;
}

// get profile by pid
export const getProfileByPid = async (pid: number):Promise<Profile[]> => {
  const res = await fetch(`http://localhost:8080/get/profile/pid/${pid}`);
  const data = await res.json();
  return data;
}
// get friend profile by my name
export const getFriendProfileByName = async (name: string):Promise<Friend[]> => {
  const res = await fetch(`http://localhost:8080/get/friend/profile/${name}`);
  const data = await res.json();
  return data;
}

// get chat log by name
export const getChatLogByName = async (name:string):Promise<ChatLog[]> => {
  const res = await fetch(`http://localhost:8080/get/chat/name/${name}`);
  const data = await res.json();
  return data;
}