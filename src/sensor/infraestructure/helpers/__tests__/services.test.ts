import axios from 'axios';
import { WebhookService } from '../WebhookService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebhookService', () => {
  let webhookService: WebhookService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, WEBHOOK_URL: 'http://mock-webhook.com/test' };
    webhookService = new WebhookService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('B17: debe llamar al método sendNotification si la temperatura supera el umbral', async () => {
    mockedAxios.post.mockResolvedValue({});
    await webhookService.sendWebhookNotification('40'); // Temperatura alta
    expect(mockedAxios.post).toHaveBeenCalledWith('http://mock-webhook.com/test', expect.any(Object));
  });

  it('B18: debe llamar a sendNotification si la humedad supera el umbral (diseñada para fallar)', async () => {
    mockedAxios.post.mockResolvedValue({});
    await webhookService.sendWebhookNotification( '90'); // Humedad alta
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});