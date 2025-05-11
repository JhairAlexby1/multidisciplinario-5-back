import {IWebhookService} from "../../application/services/IWebhookService"
import axios from 'axios';

export class WebhookService implements IWebhookService {
    private readonly webhookUrl: string = process.env.WEBHOOK_URL!;

    async sendWebhookNotification(data: string): Promise<void> {
        try {
            await axios.post(this.webhookUrl, {
                content: "The temperature is not within range. The temperature is " + data + " degrees"
            });
        } catch (error) {
            console.error('Error sending webhook notification', error);
        }
    }
}