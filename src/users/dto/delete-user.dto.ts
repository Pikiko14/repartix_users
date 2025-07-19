import { IsString, IsOptional } from "class-validator";

export class DeleteUsersDto {
    
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  parent_id: string;

}