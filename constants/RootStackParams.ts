import { OrderRequestResponse } from "../types/OrderRequestResponse";
import { PostResponse } from "../types/PostResponse";
import { SellerResponse } from "../types/SellerResponse";

export type RootStackParamList = {
  UserHome: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  SellerHome: undefined;
  UserTabs: undefined;
  ChatTab: undefined;
  SellerTabs: undefined;
  SearchPage: undefined;
  Processes: undefined;
  Shippable: undefined;
  CreateShipment: {
    processId: string;
  };
  ChatStack: undefined;
  Conversations: undefined;
  Chat: {
    conversationId: string;
  }
  Shipments: undefined;
  SellerShipments: undefined;
  ShipmentsTab: undefined;
  SellerShipmentsTab: undefined;
  ShipmentDetails: {
    shipmentId: string
  }
  SellerShipmentDetails: {
    shipmentId: string
  }
  ReviewUser: {
    userId: string
  }
  ReviewSeller: {
    sellerId: string
  }
  Wallet: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  CreateRefundRequest: {
    processId: string;
  }
  CreateProcess: {
    requestId: string;
  }
  AcceptAndPay: {
    stepId: string
  }
  ProcessDetails: {
    processId: string;
  }
  HomeTab: undefined;
  ProcessesTab: undefined;
  ProfileTab: undefined;
  SellerProcessesTab: undefined;
  SellerProcesses: undefined;
  SellerProcessDetails: {
    processId: string,
  };
  AddStep: {
    processId: string,
    previousStepId: string | null
  },
  EditStep: {
    stepId: string
  }
  SellerDetails: {
    seller: SellerResponse
  };
  PostDetails: {
    seller: SellerResponse,
    hasMorePosts: boolean,
    selectedPostIndex: number,
    posts: PostResponse[]
  }
  Settings: undefined;
  Notifications: undefined,
  CreatePost: {
    seller: SellerResponse
  },
  Comments: {
    postId: string
  },
  OrderRequest: {
    sellerId: string
  },
  OrderRequestDetails: {
    orderRequest: OrderRequestResponse,
    respondable: boolean,
  }
};