React-Native-Reconnecting-WebSocket
=====================

React native auto reconnect websocket extends WebSocketModule.
API design referenced [reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket).

🇨🇳[中文文档](https://www.jianshu.com/p/a9ead3f2139d)

It is API compatible, so when you have:
```javascript
var ws = new WebSocket('ws://....');
```
you can replace with:
```javascript
import ReconnectingWebSocket from 'react-native-reconnecting-websocket'

var ws = new ReconnectingWebSocket('ws://....');
```
Less code, more exponential.

## Install <a href="https://npmjs.org/package/react-native-reconnecting-websocket"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-reconnecting-websocket.svg?style=flat-square"></a> <a href="https://npmjs.org/package/react-native-reconnecting-websocket"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-reconnecting-websocket.svg?style=flat-square"></a>
```bash
npm i react-native-reconnecting-websocket
```
## How reconnections occur
With the standard WebSocket API, the events you receive from the WebSocket instance are typically:
```bash
onopen
onmessage
onmessage
onmessage
onclose // At this point the WebSocket instance is dead.
```
With a ReconnectingWebSocket, after an onclose event is called it will automatically attempt to reconnect. In addition, a connection is attempted repeatedly (with a small pause) until it succeeds. So the events you receive may look something more like:
```bash
onopen
onmessage
onmessage
onmessage
onclose
// ReconnectingWebSocket attempts to reconnect
onopen
onmessage
onmessage
onmessage
onclose
// ReconnectingWebSocket attempts to reconnect
onopen
onmessage
onmessage
onmessage
onclose
```
This is all handled automatically for you by the library.

## Parameters

```javascript
var socket = new ReconnectingWebSocket(url, protocols, options);
```

#### `url`
- The URL you are connecting to.
- https://html.spec.whatwg.org/multipage/comms.html#network

#### `protocols`
- Optional string or array of protocols per the WebSocket spec.
- https://tools.ietf.org/html/rfc6455

#### `options`
- Options (see below)

## Options

Options can either be passed as the 3rd parameter upon instantiation or set directly on the object after instantiation:

```javascript
var socket = new ReconnectingWebSocket(url, null, {reconnectInterval: 3000});
```

#### `reconnectInterval`
- The number of milliseconds to delay before attempting to reconnect.
- Accepts `integer`
- Default: `1000`

#### `maxReconnectInterval`
- The maximum number of milliseconds to delay a reconnection attempt.
- Accepts `integer`
- Default: `30000`

#### `reconnectDecay`
- The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
- Accepts `integer` or `float`
- Default: `1.5`

#### `timeoutInterval`
- The maximum time in milliseconds to wait for a connection to succeed before closing and retrying.
- Accepts `integer`
- Default: `2000`

#### `maxReconnectAttempts`
- The maximum number of reconnection attempts that will be made before giving up. If null, reconnection attempts will be continue to be made forever.
- Accepts `integer` or `null`.
- Default: `null`

#### `origin`
- Preserve deprecated backwards compatibility for the `origin` option

#### `headers` 
- Specifying `origin` as a WebSocket connection option is deprecated. Include it under `headers` instead
- Accepts `origin` and `Cookie`
- Example:
  ```javascript
  WebSocket(url, '', { headers: { Cookie: 'key=value', origin: "https://secret-host.com" } });
  ```

---

## Methods

#### `ws.close(code?: number, reason?: string)`

- Closes the WebSocket connection or connection attempt, if any. If the connection is already CLOSED, this method does nothing.
- `code` is optional the closing code (default value 1000). [https://tools.ietf.org/html/rfc6455#section-7.4.1](https://tools.ietf.org/html/rfc6455#section-7.4.1)
- `reason` is the optional reason that the socket is being closed. [https://tools.ietf.org/html/rfc6455#section-7.1.6](https://tools.ietf.org/html/rfc6455#section-7.1.6)

#### `ws.send(data: string | ArrayBuffer | ArrayBufferView | Blob)`

- Transmits data to the server over the WebSocket connection.
- Accepts @param data a text string, ArrayBuffer, ArrayBufferView or Blob

#### `ws.ping()`

- Sending websocket ping/pong frame.
- Some servers do not support it and need to be implemented manually, like `How to add heartbeat?`

#### `ws.reconnect()`

- Additional public API method to refresh the connection if still open (close, re-open).
- For example, if the app suspects bad data / missed heart beats, it can try to refresh.


See the more detail in [[react-native/WebSocket.js@3982a2c6]](https://github.com/facebook/react-native/blob/3982a2c6bd116a6dcc6ee6889e4a246b710b70a7/Libraries/WebSocket/WebSocket.js)
<br/>

# For example: How to add heartbeat?
1. usual
```javascript
import ReconnectingWebSocket from 'react-native-reconnecting-websocket'

const ws = new ReconnectingWebSocket("ws://...");

// ws listeners
ws.onopen = (e) => {
    console.log("onopen",e)
};
ws.onmessage = (evt) => {
    console.log("onmessage",JSON.parse(evt.data))
};
ws.onclose = (e) => {
    console.log("onclose",e)
};
ws.onerror = (e) => {
    console.log("onerror",e)
};

/*
 * listen reconnecting event (Powered by ReconnectingWebSocket)
 * @params reconnectAttempts 尝试重连的次数
 */
ws.onconnecting = (reconnectAttempts) => {
    console.log("onconnecting", reconnectAttempts)
}
```
2. add heartbeat
```javascript
ws.onopen = (e) => {
    // execute immediately!
    ws.send("heartbeat string");
    
    heartCheck.reset().start()
};

ws.onmessage = (evt) => {
    heartCheck.reset().start()
};

ws.onclose = () => {
    if(logout){//如果前端主动关闭(如退出登陆)，不做处理

    }else {//如果服务器主动关闭，前端也需要重连时使用
        heartCheck.reset().start() 
    }
};

var heartCheck = {
    timeout: 10000,//default 10s
    timeoutObj: null,
    serverTimeoutObj: null,
    reset:function(){
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start:function(){
        let self = this;
        this.timeoutObj = setTimeout(function(){
            if(ws.readyState === ws.OPEN){
              ws.send("heartbeat string");
            }
            self.serverTimeoutObj = setTimeout(function(){
                ws.reconnect();//本库提供
            }, self.timeout)
        }, this.timeout)
    }
}
```
