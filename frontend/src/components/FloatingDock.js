'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var utils_1 = require("@/lib/utils");
var FloatingDock = function () {
    var router = (0, navigation_1.useRouter)();
    var pathname = (0, navigation_1.usePathname)();
    var navItems = [
        { icon: lucide_react_1.Home, label: 'Home', path: '/' },
        { icon: lucide_react_1.Compass, label: 'Discover', path: '/discover' },
        { icon: lucide_react_1.PlusSquare, label: 'Create', path: '/create' },
        { icon: lucide_react_1.Users, label: 'Community', path: '/community' },
        { icon: lucide_react_1.UserCircle, label: 'Profile', path: '/profile' },
    ];
    return (<div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto bg-gray-900/50 backdrop-blur-md rounded-full flex items-center justify-center p-2 space-x-2 border border-gray-700/50">
      {navItems.map(function (item) { return (<button key={item.label} onClick={function () { return router.push(item.path); }} className={(0, utils_1.cn)('flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ease-in-out group', {
                'text-white bg-zeeky-blue/20': pathname === item.path,
                'text-gray-400 hover:bg-zeeky-blue/20 hover:text-white': pathname !== item.path,
            })}>
          <item.icon className="w-6 h-6"/>
          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.label}
          </span>
        </button>); })}
    </div>);
};
exports.default = FloatingDock;
