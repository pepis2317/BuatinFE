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
    authorId:string
    initialPostId:string
  }
  Settings: undefined;
  Notifications: undefined,
  CreatePost:{
    producer: ProducerResponse
  }
};