"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var ChatGateway = function () {
    var _classDecorators = [(0, websockets_1.WebSocketGateway)({ cors: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _server_decorators;
    var _server_initializers = [];
    var _server_extraInitializers = [];
    var _handleMessage_decorators;
    var _handleJoin_decorators;
    var _handleTyping_decorators;
    var ChatGateway = _classThis = /** @class */ (function () {
        function ChatGateway_1() {
            this.server = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _server_initializers, void 0));
            __runInitializers(this, _server_extraInitializers);
        }
        ChatGateway_1.prototype.afterInit = function (_server) {
            console.log('WebSocket server initialized');
        };
        ChatGateway_1.prototype.handleConnection = function (client) {
            console.log("Client connected: ".concat(client.id));
        };
        ChatGateway_1.prototype.handleDisconnect = function (client) {
            console.log("Client disconnected: ".concat(client.id));
        };
        ChatGateway_1.prototype.handleMessage = function (data, _client) {
            // Broadcast to all clients in the conversation room
            this.server.to(data.conversationId).emit('receiveMessage', data);
        };
        ChatGateway_1.prototype.handleJoin = function (data, client) {
            client.join(data.conversationId);
            client.emit('joinedConversation', { conversationId: data.conversationId });
        };
        ChatGateway_1.prototype.handleTyping = function (data, _client) {
            // Broadcast typing indicator to all clients in the conversation room
            this.server.to(data.conversationId).emit('typing', data);
        };
        return ChatGateway_1;
    }());
    __setFunctionName(_classThis, "ChatGateway");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [(0, websockets_1.WebSocketServer)()];
        _handleMessage_decorators = [(0, websockets_1.SubscribeMessage)('sendMessage')];
        _handleJoin_decorators = [(0, websockets_1.SubscribeMessage)('joinConversation')];
        _handleTyping_decorators = [(0, websockets_1.SubscribeMessage)('typing')];
        __esDecorate(_classThis, null, _handleMessage_decorators, { kind: "method", name: "handleMessage", static: false, private: false, access: { has: function (obj) { return "handleMessage" in obj; }, get: function (obj) { return obj.handleMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleJoin_decorators, { kind: "method", name: "handleJoin", static: false, private: false, access: { has: function (obj) { return "handleJoin" in obj; }, get: function (obj) { return obj.handleJoin; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleTyping_decorators, { kind: "method", name: "handleTyping", static: false, private: false, access: { has: function (obj) { return "handleTyping" in obj; }, get: function (obj) { return obj.handleTyping; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: function (obj) { return "server" in obj; }, get: function (obj) { return obj.server; }, set: function (obj, value) { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChatGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChatGateway = _classThis;
}();
exports.ChatGateway = ChatGateway;
