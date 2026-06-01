export interface AuthHttpGateway {
  handle(request: Request): Promise<Response> | Response;
}
