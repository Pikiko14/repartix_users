import { HydratedDocument } from 'mongoose';
import { TypeUser } from '../entities/auth.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ContractType, VehicleType } from '../entities/auth.entity';

@Schema({ _id: false })
class CourierInfo {
  @Prop({ enum: Object.values(VehicleType) })
  vehicle_type?: VehicleType;

  @Prop()
  license_plate?: string;

  @Prop()
  driving_license_number?: string;

  @Prop()
  has_insurance?: boolean;

  @Prop()
  insurance_expiry?: Date;

  @Prop()
  is_active?: boolean;

  @Prop({ enum: Object.values(ContractType) })
  contract_type?: ContractType;

  @Prop()
  amount_by_delivery?: number;
}
export const CourierInfoSchema = SchemaFactory.createForClass(CourierInfo);

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class Profile {
  @Prop({ required: false, index: true })
  full_name?: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop()
  age?: number;

  @Prop()
  dni?: string;
}
export const ProfileSchema = SchemaFactory.createForClass(Profile);

@Schema({ _id: false })
class Configuration {
  @Prop()
  currency?: string;

  @Prop()
  country?: string;

  @Prop()
  gmap_api__key?: string;

  @Prop()
  route_price_by_km?: boolean;

  @Prop()
  enable_google_map?: boolean;

  @Prop()
  price_by_km?: number;

  @Prop({ required: false })
  statuses?: string;

  @Prop({ required: false })
  payments?: string;
}
export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

@Schema({ _id: false })
class Brand {
  @Prop({ required: false, index: true })
  name?: string;

  @Prop()
  rut?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  image_brand?: string;

  @Prop({ type: Configuration })
  configuration?: Configuration;
}
export const BrandSchema = SchemaFactory.createForClass(Brand);


// senders schema
@Schema({ _id: false })
export class Coords {
  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  lng: number;
}
@Schema({ _id: false })
export class Address {
  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Coords, required: true })
  coords: Coords;

  @Prop({ type: String, required: true })
  complement: string;
}

@Schema({ timestamps: true })
export class SenderInfo {
  @Prop({ type: String, required: false })
  id?: string;

  @Prop({ type: String, required: false })
  _id?: string;

  @Prop({ type: String, required: false })
  rut?: string;

  @Prop({ type: String, required: true })
  brand_name: string;

  @Prop({ type: String, required: true })
  manager: string;

  @Prop({ type: String, required: false })
  brand_phone?: string;

  @Prop({ type: [Address], required: true })
  address: Address[];
}
const SenderInfoSchema = SchemaFactory.createForClass(SenderInfo);
// end sender schema

@Schema({ autoIndex: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  scopes: string[];

  @Prop()
  parent_id?: string;

  @Prop()
  recovery_token?: string;

  @Prop({ type: ProfileSchema })
  profile: Profile;

  @Prop({ type: BrandSchema })
  brand: Brand;

  @Prop({ enum: ['admin', 'sender', 'delivery', 'employe'], default: 'admin' })
  type_user: TypeUser;

  @Prop({ type: CourierInfoSchema })
  courier_info?: CourierInfo;

  @Prop({ type: SenderInfoSchema })
  sender_info?: SenderInfo;
}

export const UsersSchema = SchemaFactory.createForClass(User);

// Excluir la contraseña al convertir a JSON
UsersSchema.set('toJSON', {
  transform: function (_, ret) {
    delete ret.password;
    return ret;
  },
});
