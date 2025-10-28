export type BiteshipItem = {
  name: string;
  description: string;
  category: string;
  value: number;
  quantity: number;
  height: number;
  width: number;
  length: number;
  weight: number;
};

export type BiteshipTrackResponse = {
  success: boolean;
  message: string;
  object: string;
  id: string;
  shortId: string;
  shipper: Shipper;
  origin: Origin;
  delivery: Delivery;
  voucher: Voucher;
  courier: Courier;
  referenceId?: string;
  invoiceId?: string;
  items: BiteshipItem[];
  note?: string;
  currency: string;
  price: number;
  status: string;
  ticketStatus?: string;
  draftOrderId?: string;
  returnId?: string;
};

export type Courier = {
  trackingId: string;
  waybillId: string;
  company: string;
  history: History[];
  link: string;
  name?: string;
  phone?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlateNumber?: string;
  driverPhotoUrl?: string;
  type: string;
  routingCode?: string;
  shipmentFee: number;
  insurance: Insurance;
};

export type History = {
  serviceType: string;
  status: string;
  note: string;
  /** ISO 8601 string from DateTimeOffset */
  updatedAt: string;
};

export type Insurance = {
  amount: number;
  amountCurrency: string;
  fee: number;
  feeCurrency: string;
  note?: string;
};

export type Voucher = {
  id?: string;
  name?: string;
  value?: number;
  type?: string;
};

export type Delivery = {
  /** ISO 8601 string from DateTimeOffset */
  datetime: string;
  note?: string;
  type: string;
  distance?: string;
  distanceUnit?: string;
};

export type Shipper = {
  name: string;
  email: string;
  phone: string;
  organization: string;
};

export type Origin = {
  contactName: string;
  contactPhone: string;
  address: string;
  note: string;
  postalCode: number;
  coordinate: BiteshipCoordinate;
  collectionMethod: string;
  administrativeDivisionLevel1Name: string;
  administrativeDivisionLevel2Name: string;
  administrativeDivisionLevel3Name: string;
  administrativeDivisionLevel4Name: string;
};

export type BiteshipCoordinate = {
  latitude?: number;
  longitude?: number;
};

export type Destination = {
  contactName: string;
  contactPhone: string;
  address: string;
  note: string;
  proofOfDelivery: Proof;
  postalCode: number;
  coordinate: BiteshipCoordinate;
  cashOnDelivery: Cod;
  administrativeDivisionLevel1Name: string;
  administrativeDivisionLevel2Name: string;
  administrativeDivisionLevel3Name: string;
  administrativeDivisionLevel4Name: string;
};

export type Proof = {
  use: boolean;
  fee: number;
  note: string;
  link: string;
};

export type Cod = {
  id?: string;
  amount: number;
  fee: number;
  amountCurrency: string;
  feeCurrency: string;
  note?: string;
  type?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
};
