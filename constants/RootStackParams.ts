import { PostResponse } from "../types/PostResponse";
import { ProducerResponse } from "../types/ProducerResponse";

export type RootStackParamList = {
  UserHome: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  ProducerHome: undefined;
  UserTabs: undefined;
  ProducerTabs: undefined;
  SearchPage: undefined;
  ProducerDetails: {
    producer: ProducerResponse
  };
  PostDetails:{
    producer:ProducerResponse,
    hasMorePosts:boolean,
    selectedPostIndex: number,
    posts:PostResponse[]
  }
  Settings: undefined;
  Notifications: undefined,
  CreatePost:{
    producer: ProducerResponse
  },
  Comments:{
    postId:string
  }
};