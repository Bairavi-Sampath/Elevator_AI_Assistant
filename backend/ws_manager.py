"""
WebSocket Connection Manager for Real-Time Telemetry Streaming.
Shared between main.py and api_routes.py.
"""

import time
import json
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect
from sensor_processor import processor


class ConnectionManager:
    """Manages active WebSocket connections to stream telemetry in real time."""
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast_json(self, message: dict):
        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)


manager = ConnectionManager()

