export interface IWebsocketService {
    getWebsocketData(): Promise<void>;
    getWebsocketDataByDate(date: Date): Promise<void>;
}