export type BiteshipRatesResponse = {
  success: boolean;
  object: string;
  message: string;
  code: number;
  origin: RatesResponseOrigin;
  destination: RatesResponseOrigin;
  pricing: RatesPricing[];
};

export type RatesPricing = {
  available_collection_method: string[];
  available_for_cash_on_delivery: boolean;
  available_for_proof_of_delivery: boolean;
  available_for_instant_waybill_id: boolean;
  available_for_insurance: boolean;
  company: string;
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  currency: string;
  description: string;
  duration: string;
  shipment_duration_range: string;
  shipment_duration_unit: string;
  service_type: string;
  shipping_type: string;
  price: number;
  shipping_fee: number;
  type: string;
};

export type RatesResponseOrigin = {
  location_id?: string;
  latitude?: number;
  longitude?: number;
  postal_code: number;
  country_name: string;
  country_code: string;
  administrative_division_level_1_name: string;
  administrative_division_level_1_type: string;
  administrative_division_level_2_name: string;
  administrative_division_level_2_type: string;
  administrative_division_level_3_name: string;
  administrative_division_level_3_type: string;
  administrative_division_level_4_name: string;
  administrative_division_level_4_type: string;
  address?: string;
};
