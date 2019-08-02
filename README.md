React-Native-ReconnectingWebSocket
=====================

React native auto reconnect websocket extends WebSocketModule.
API design referenced [reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket).

It is API compatible, so when you have:
```javascript
var ws = new WebSocket('ws://....');
```
you can replace with:
```javascript
var ws = new ReconnectingWebSocket('ws://....');
```
Less code, more exponential.


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

####`reconnectDecay`
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
