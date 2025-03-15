import { v4 as uuidv4 } from 'uuid';
import { Injectable } from "@nestjs/common";

@Injectable()
export class Utils {
  // generate UUID
  generateUuId(): string {
    const uuidToken = uuidv4();
    return uuidToken;
  }
}