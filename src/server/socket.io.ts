import express from "express";
import http from "http";
import SocketServer from "socket.io";

export const app = express();
export const server = http.createServer(app);
export const io = new SocketServer.Server(server, {
    cors: {

        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});
