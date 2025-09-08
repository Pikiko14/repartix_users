export enum TypeUser {
  admin = "admin",
  sender = "sender",
  delivery = "delivery",
  employe = "employe"
}

interface ISenderInfo {
  id?: string;
  _id?: string;
  rut?: string;
  brand_name: string;
  manager: string;
  brand_phone?: string;
  address: Address[];
  discount_porcent?: number;
  comission_porcent?: number;
}

interface Address {
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
  complement: string;
}
export class UserEntity {
  username: string;
  password: string;
  email: string;
  scopes: string[];
  profile?: IProfile;
  brand?: IBrand;
  parent_id?: string;
  _id?: string;
  recovery_token?: string;
  password_string?: string;
  type_user: TypeUser;
  courier_info?: ICourierInfo;
  sender_info?: ISenderInfo;
}

interface IProfile {
  full_name: string;
  address?: string;
  phone?: number;
  age?: number;
  dni?: string;
}

interface IBrand {
  name: string;
  rut: string;
  phone: number;
  address: string;
  image_brand?: string;
  configuration:  IConfiguration;
}

interface IConfiguration {
  country?: string;
  currency?: string;
  gmap_api__key?: string;
  route_price_by_km?: boolean;
  enable_google_map?: boolean;
  price_by_km?: number;
  statuses?: string;
  payments?: string;
  insurance_percentage?: number;
}

interface ICourierInfo {
  vehicle_type?: VehicleType;
  license_plate?: string;
  driving_license_number?: string;
  has_insurance?: boolean;
  insurance_expiry?: Date;
  is_active?: boolean;
  contract_type?: ContractType;
  amount_by_delivery?: string;
}

export enum ContractType {
  fixed = "fixed",
  per_delivery = "per_delivery"
}

export enum VehicleType {
  bike = "bike",
  motorcycle = "motorcycle",
  car = "car",
  on_foot = "on_foot",
  scooter = "scooter",
  other = "other"
}

