// import {NativeModules} from 'react-native'
// const {WebSocketModule} = NativeModules;
import WebSocketModule from 'react-native/Libraries/WebSocket/NativeWebSocketModule';


let settings = {
    /** The number of milliseconds to delay before attempting to reconnect. */
    reconnectInterval: 1000,
    /** The maximum number of milliseconds to delay a reconnection attempt. */
    maxReconnectInterval: 30000,
    /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
    reconnectDecay: 1.5,

    /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
    timeoutInterval: 2000,

    /** The maximum number of reconnection attempts to make. Unlimited if null. */
    maxReconnectAttempts: null,
};


class ReconnectingWebSocket extends WebSocket{
    constructor(url,protocols,options) {
        if (!options) { options = {}; }
        super(url,protocols,{headers:options.headers});

        // Overwrite and define settings with options if they exist.
        for (let key in settings) {
            if (typeof options[key] !== 'undefined') {
                this[key] = options[key];
            } else {
                this[key] = settings[key];
            }
        }

        // These should be treated as read-only properties

        /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
        this.url = url;

        /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
        this.reconnectAttempts = 0;

        this.protocols = protocols;

        this.timeout = null;
    }

    _unregisterEvents(){
        if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
            return super._unregisterEvents();
        }
    }

    _registerEvents(){
        super._registerEvents();
        this._subscriptions.push(

            /** @Override onopen **/
            this._eventEmitter.addListener('websocketOpen', ev => {
                if (ev.id !== this._socketId) {
                    return;
                }

                this.timeout && clearTimeout(this.timeout);
                this.reconnectAttempts = 0
            }),

            /** @Override onerror **/
            this._eventEmitter.addListener('websocketFailed', ev => {
                if (ev.id !== this._socketId) {
                    return;
                }

                let _timeout = this.reconnectInterval * Math.pow(this.reconnectDecay, this.reconnectAttempts);

                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(()=>{
                    this.reconnectAttempts++;
                    this.reconnect()
                }, _timeout > this.maxReconnectInterval ? this.maxReconnectInterval : _timeout);
            })
        )
    }

    reconnect(){
        if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
            return;
        }
        this.timeout = setTimeout(()=>{

            WebSocketModule.connect(
                this.url,
                this.protocols,
                this.headers || {},
                this._socketId,
            );
            this.onconnecting({reconnectAttempts:this.reconnectAttempts})

        }, this.reconnectInterval);

    }

    onconnecting(){}
}

export default ReconnectingWebSocket;
