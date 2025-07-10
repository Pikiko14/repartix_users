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
}

interface IProfile {
  full_name: string;
  address?: string;
  phone?: number;
  age?: number;
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
  currency: string;
  enable_google_map?: boolean;
}
