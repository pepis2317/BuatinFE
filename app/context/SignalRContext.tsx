import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as SignalR from "@microsoft/signalr";
import { API_URL } from "../../constants/ApiUri";
import { AppState } from "react-native";
const API_WITHOUT_THINGY = API_URL.slice(0, API_URL.length - 7)
const HUB_URL = `${API_WITHOUT_THINGY}/hubs/chat`;
type SignalRContextValue = {
    connection: SignalR.HubConnection | null
    isConnected: boolean
    start: () => Promise<void>
    stop: () => Promise<void>
    on: (event: string, handler: (...args: any[]) => void) => void
    off: (event: string, handler: (...args: any[]) => void) => void
    invoke: <T = unknown>(method: string, ...args: any[]) => Promise<T>;
}
const SignalRContext = createContext<SignalRContextValue | undefined>(undefined)
let singletonConnection: SignalR.HubConnection | null = null
type Props = {
    children: React.ReactNode
    // Provide your async token getter from your AuthContext
    getUserToken: () => Promise<string | null>;
    // Optionally rejoin groups (or any resubscribe logic) after reconnect
    onReconnected?: (conn: SignalR.HubConnection) => Promise<void> | void;
}
export function SignalRProvider({ children, getUserToken, onReconnected }: Props) {
    const [isConnected, setIsConnected] = useState(false);
    const listenersRef = useRef(new Map<string, Set<(...args: any[]) => void>>());

    // Build (or reuse) the singleton
    const connection = useMemo(() => {
        if (singletonConnection) return singletonConnection;

        const conn = new SignalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: async () => (await getUserToken()) ?? "",
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (ctx) => {
                    // Backoff: 0s, 2s, 5s, 10s, then 10s caps
                    const delays = [0, 2000, 5000, 10000];
                    return delays[Math.min(ctx.previousRetryCount, delays.length - 1)];
                },
            })
            .withHubProtocol(new SignalR.JsonHubProtocol())
            .configureLogging(SignalR.LogLevel.Information)
            .build();

        // Lifecycle events
        conn.onclose((err) => {
            setIsConnected(false);
            if (err) console.log("[SignalR] closed with error:", err.message);
            else console.log("[SignalR] closed");
        });

        conn.onreconnecting((err) => {
            setIsConnected(false);
            console.log("[SignalR] reconnecting...", err?.message);
        });

        conn.onreconnected(async (id) => {
            setIsConnected(true);
            console.log("[SignalR] reconnected. ConnId:", id);
            try {
                // Re-attach all event handlers (SignalR keeps them, but this is safe) and rejoin groups if needed
                if (onReconnected) await onReconnected(conn);
            } catch (e) {
                console.warn("[SignalR] onReconnected failed:", e);
            }
        });

        singletonConnection = conn;
        return conn;
    }, [getUserToken, onReconnected]);

    // Start once on mount
    useEffect(() => {
        let isMounted = true;

        const start = async () => {
            if (!connection) return;
            if (connection.state === SignalR.HubConnectionState.Connected) {
                setIsConnected(true);
                return;
            }
            try {
                await connection.start();
                console.log("[SignalR] started");
                if (isMounted) setIsConnected(true);
            } catch (e) {
                console.warn("[SignalR] start failed, will retry on next render or trigger:", e);
            }
        };

        start();

        // Optional: pause/resume on app background/foreground
        const sub = AppState.addEventListener("change", async (state) => {
            if (!connection) return;
            if (state === "active") {
                if (connection.state !== SignalR.HubConnectionState.Connected) {
                    try {
                        await connection.start();
                        setIsConnected(true);
                    } catch { }
                }
            }
        });

        return () => {
            isMounted = false;
            sub.remove();
        };
    }, [connection]);

    // Public API
    const value = useMemo<SignalRContextValue>(() => {
        const on = (event: string, handler: (...args: any[]) => void) => {
            if (!connection) return;
            connection.on(event, handler);
            if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
            listenersRef.current.get(event)!.add(handler);
        };

        const off = (event: string, handler: (...args: any[]) => void) => {
            if (!connection) return;
            connection.off(event, handler);
            listenersRef.current.get(event)?.delete(handler);
        };

        return {
            connection,
            isConnected,
            start: async () => {
                if (!connection) return;
                if (connection.state !== SignalR.HubConnectionState.Connected) {
                    await connection.start();
                    setIsConnected(true);
                }
            },
            stop: async () => {
                if (!connection) return;
                await connection.stop();
                setIsConnected(false);
            },
            on,
            off,
            invoke: async <T = unknown>(method: string, ...args: any[]) => {
                if (!connection) throw new Error("SignalR not ready");
                return connection.invoke<T>(method, ...args);
            },
        };
    }, [connection, isConnected]);

    return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
}
export function useSignalR() {
    const ctx = useContext(SignalRContext);
    if (!ctx) throw new Error("useSignalR must be used within <SignalRProvider>");
    return ctx;
}
