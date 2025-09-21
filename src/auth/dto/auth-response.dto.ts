// src/auth/dto/auth-response.dto.ts
import { User } from '../../user/entities/user.entity';

export class AuthResponseDto {
  user: Pick<User, 'id' | 'email' | 'role'>;
  token: string; // keep this name consistent with AuthService
}
