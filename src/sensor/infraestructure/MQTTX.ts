import amqp from 'amqplib';
import {json} from "express";

const MQTTX_URL = process.env.MQTTX_URL || 'amqp://localhost';

export class MQTTX {
    private connection?: amqp.Connection;
    private channel?: amqp.Channel;

    async connect() {
        try {
            this.connection = await amqp.connect(MQTTX_URL);
            this.channel = await this.connection.createChannel();
            console.log('Connected to EMQP');
        } catch (error) {
            console.error('Failed to connect to EMQP ', error);
            throw error;
        }
    }

    async createQueue(queue: string) {
        if (!this.channel) {
            throw new Error('Channel not created');
        }
        try {
            await this.channel.assertQueue(queue, {durable: true});
            console.log('Queue created: ', queue);
        } catch (error) {
            console.error('Failed to create queue ', error);
            throw error;
        }
    }

    async sendMessage(queue: string, message: string) {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        try {
            const bufferMessage = Buffer.from(JSON.stringify(message));
            const sent = this.channel.sendToQueue(queue, bufferMessage, {persistent: true});
            if (!sent) {
                console.error('Failed to send message to queue ' + queue + ': Queue is full or not ready');
                throw new Error('Failed to send message to queue '+ queue);
            }
            console.log('Message sent to queue ' + queue + ':', message);
        } catch (error) {
            console.error('Failed to send message ', error);
            throw error;
        }
    }

    async consumeMessage(queue: string, callback: (message: amqp.ConsumeMessage | null) => void) {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        try {
            await this.channel.consume(queue, callback, {noAck: true});
            console.log('Consuming messages from queue ' + queue);
        } catch (error) {
            console.error('Failed to consume message from queue ' + queue + ':', error);
            throw error;
        }
    }

    ackMessage(message: amqp.Message) {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }
        try {
            this.channel.ack(message);
        } catch (error) {
            console.error('Failed to acknowledge message ', error);
            throw error;
        }
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                console.log('Channel closed');
            }
            if (this.connection) {
                await this.connection.close();
                console.log('Connection closed');
            }
        } catch (error) {
            console.log('Failed to close MQTTX connection:', error);
        }
    }
}