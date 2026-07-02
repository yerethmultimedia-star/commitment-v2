export interface Command<TPayload = unknown> {
  readonly name: string;
  readonly payload: TPayload;
}

export interface Query<TPayload = unknown> {
  readonly name: string;
  readonly payload: TPayload;
}

export interface CommandHandler<TCommand extends Command = Command, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}

export interface QueryHandler<TQuery extends Query = Query, TResult = unknown> {
  handle(query: TQuery): Promise<TResult>;
}
