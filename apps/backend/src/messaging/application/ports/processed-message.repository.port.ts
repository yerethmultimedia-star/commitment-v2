export interface ProcessedMessageRepository {
  /**
   * Attempts to claim the processing of a message.
   * Returns true if the message was successfully claimed for processing.
   * Returns false if it is already Processing or Completed.
   * If it was Failed, it should return true and update to Processing.
   */
  tryBeginProcessing(messageId: string, consumerName: string): Promise<boolean>;

  /**
   * Marks a message as successfully completed for a given consumer.
   */
  markCompleted(messageId: string, consumerName: string): Promise<void>;

  /**
   * Marks a message as failed for a given consumer.
   */
  markFailed(
    messageId: string,
    consumerName: string,
    error?: string,
  ): Promise<void>;
}

export const PROCESSED_MESSAGE_REPOSITORY_TOKEN = 'ProcessedMessageRepository';
