import { PostResponse } from "../types/PostResponse";
import { SellerResponse } from "../types/SellerResponse";

export type RootStackParamList = {
  UserHome: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  SellerHome: undefined;
  UserTabs: undefined;
  SellerTabs: undefined;
  SearchPage: undefined;
  SellerDetails: {
    seller: SellerResponse
  };
  PostDetails:{
    seller:SellerResponse,
    hasMorePosts:boolean,
    selectedPostIndex: number,
    posts:PostResponse[]
  }
  Settings: undefined;
  Notifications: undefined,
  CreatePost:{
    seller: SellerResponse
  },
  Comments:{
    postId:string
  }
};