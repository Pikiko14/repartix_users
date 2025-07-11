import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const UsersSchema = SchemaFactory.createForClass(User);

// Excluir la contraseña al convertir a JSON
UsersSchema.set('toJSON', {
  transform: function (_, ret) {
    delete ret.password;
    return ret;
  },
});
