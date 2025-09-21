import { User } from '@prisma/client';

export class AuthResponseDto {
  user: Pick<User, 'id' | 'email' | 'role'>;
  accessToken: string;
}
