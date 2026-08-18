export class OrderError extends Error {
  constructor(
    message: string,
    public status: number,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "OrderError";
  }
}
