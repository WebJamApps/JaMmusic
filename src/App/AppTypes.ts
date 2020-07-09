export interface GoogleBody {
  clientId?: string,
  redirectUri: string,
  code: string,
  state(): string,
}
