export class AuthResponseDto {
  user: Pick<User, 'id' | 'email' | 'role'>;
  accessToken: string;
}
