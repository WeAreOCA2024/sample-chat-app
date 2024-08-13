export interface MyData{
  id: number;
  name: string;
  pass: string;
}

export interface Profile{
  id: number;
  user_id: number;
  name: string;
}
export interface Friend{
  id: number;
  user1_id: number;
  user2_id: number;
  user1_pid: number;
  user2_pid: number;
  time: string;
}

export interface ChatLog{
  id: number;
  from_pid: number;
  to_pid: number;
  from_userid: number;
  to_userid: number;
  msg: string;
  time: string;
  delete_from: boolean;
  delete_to: boolean;
  from_reaction: number;
  to_reaction: number;
}