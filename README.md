# RNWebsocket
webSocket module in react-native add reconnect and heartbeat

It is API compatible, so when you have:
```javascript
var ws = new WebSocket('ws://....');
```
you can replace with:
```javascript
var ws = new RNWebSocket('ws://....');
```

### Options
Options can either be passed as the 3rd parameter upon instantiation or set directly on the object after instantiation:
```javascript
var socket = new RNWebSocket(url, null, {debug: true, reconnectInterval: 3000});
```
