export class DomainError extends Error {
  constructor(
    message,
    private readonly previous?: Error,
  ) {
    super(message);
  }

  public getPrevious() {
    return this.previous;
  }
}
