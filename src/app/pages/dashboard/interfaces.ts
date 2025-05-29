export interface ServiceProvider {
  id?: string;
  country: string;
  spName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  postalCode: string;
  businessName: string;
}

export interface BusinessForm {
  id?: string;
  country: string;
  businessName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  postalCode: string;
  serviceProviders: ServiceProvider[];
}