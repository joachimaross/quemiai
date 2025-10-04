'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logo_1 = require("@/components/Logo");
var HomePage = function () {
    return (<div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <Logo_1.default />
      <h1 className="text-5xl font-bold text-zeeky-blue mt-4 mb-2 font-heading tracking-tight">
        Zeeky
      </h1>
      <p className="text-lg text-gray-300">
        Your pulse on real content. The immersive experience is loading...
      </p>
    </div>);
};
exports.default = HomePage;
