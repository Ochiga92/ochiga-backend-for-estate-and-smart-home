export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    role: string;
  };
  accessToken: string;
}
