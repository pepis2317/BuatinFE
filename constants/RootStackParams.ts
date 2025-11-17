import { CommentResponse } from "../types/CommentResponse";
import { OrderRequestResponse } from "../types/OrderRequestResponse";
import { PostResponse } from "../types/PostResponse";
import { ReviewResponse } from "../types/ReviewResponse";
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
  SellerOutgoingProcesses: undefined;
  SellerIncomingShipments: undefined;
  SellerReviews: {
    sellerId: string
  }
  EditReview: {
    review:ReviewResponse,
    isSeller:boolean
  }
  EditPost: {
    post:PostResponse
  }
  EditComment: {
    comment:CommentResponse
  }
  UserReviews: {
    userId: string
  }
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
  SellerStack: undefined;
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
  },
  UserDetails: {
    userId: string
  }
  EditSeller: undefined
  SellerDetails: {
    sellerId: string | null
  };
  PostDetails: {
    seller: SellerResponse,
    hasMorePosts: boolean,
    selectedPostIndex: number,
    posts: PostResponse[]
  }
  Settings: undefined;
  Notifications: undefined,
  CreatePost: undefined,
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