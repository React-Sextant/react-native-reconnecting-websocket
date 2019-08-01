import {NativeModules} from 'react-native'
const {WebSocketModule} = NativeModules;

let url,protocols,options;
let lockReconnect = false;//避免重复连接
let heartCheck = {
    timeout: 3000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function(){
        this.timeout = options.reconnectInterval||3000;
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function(context){
        let self = this;
        this.timeoutObj = setTimeout(()=>{
            try{context.send(options.heartBeat)}catch(err){
                context.reconnect()
            }
            self.serverTimeoutObj = setTimeout(function(){
                context.close();
            }, self.timeout)
        }, self.timeout)
    }
};
class WebSocketJs extends WebSocket{
    constructor(_url,_protocols,_options) {
        super(_url,_protocols,_options);
        url = _url;
        protocols = _protocols;
        options = _options;
    }

    _registerEvents(){
        super._registerEvents();

        //override onopen
        this._eventEmitter.addListener('websocketOpen', ev => {
            if (ev.id !== this._socketId) {
                return;
            }
            //heart check
            heartCheck.reset().start(this);
        });
        //override onmessage
        this._eventEmitter.addListener('websocketMessage', ev => {
            console.log('websocketMessage',ev,this._socketId)
            if (ev.id !== this._socketId) {
                return;
            }
            //heart check
            heartCheck.reset().start(this);
        });
        //override onclose
        this._eventEmitter.addListener('websocketClosed', ev => {
            if (ev.id !== this._socketId) {
                return;
            }
            this.reconnect()
        });
        //override onerror
        this._eventEmitter.addListener('websocketFailed', ev => {
            if (ev.id !== this._socketId) {
                return;
            }
            this.reconnect()
        })
    }

    reconnect(){
        if(lockReconnect) return;
        lockReconnect = true;
        setTimeout(()=>{
            WebSocketModule.connect(
                url,
                protocols,
                {},//headers
                this._socketId,
            );
            lockReconnect = false;
        }, options.reconnectInterval);
    }
}

export default WebSocketJs;
