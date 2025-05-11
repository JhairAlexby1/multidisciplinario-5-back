export interface IWebhookService {
    sendWebhookNotification(data: string): Promise<void>;
}