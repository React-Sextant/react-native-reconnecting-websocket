React-Native-Reconnecting-WebSocket
=====================

React native auto reconnect websocket extends WebSocketModule.
API design referenced [reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket).

[🇨🇳中文文档](https://www.jianshu.com/p/8fae2d72448f)

It is API compatible, so when you have:
```javascript
var ws = new WebSocket('ws://....');
```
you can replace with:
```javascript
var ws = new ReconnectingWebSocket('ws://....');
```
Less code, more exponential.

## Install <a href="https://npmjs.org/package/react-native-reconnecting-websocket"><img alt="npm version" src="http://img.shields.io/npm/v/react-native-reconnecting-websocket.svg?style=flat-square"></a> <a href="https://npmjs.org/package/react-native-reconnecting-websocket"><img alt="npm version" src="http://img.shields.io/npm/dm/react-native-reconnecting-websocket.svg?style=flat-square"></a>
```bash
npm i react-native-reconnecting-websocket
```


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

---

## Methods

See the detail in [react-native/WebSocket.js](https://github.com/facebook/react-native/blob/master/Libraries/WebSocket/WebSocket.js)

## How to add heartbeat?
1. usual
```javascript
ws = new WebSocket("ws://...");

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

// add listen connecting event
// @params reconnectAttempts 尝试重连的次数
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
            ws.send("heartbeat string");
            self.serverTimeoutObj = setTimeout(function(){
                ws.close();
                ws.reconnect();
            }, self.timeout)
        }, this.timeout)
    }
}
```
3. add new API `reconnect()`
```javascript
/**
 * Additional public API method to refresh the connection if still open (close, re-open).
 * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
 */
ws.reconnect()
```
