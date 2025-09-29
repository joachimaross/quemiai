"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
var google_1 = require("next/font/google");
require("./globals.css");
var utils_1 = require("@/lib/utils");
var FloatingDock_1 = require("@/components/FloatingDock");
// Configure fonts as per the design system
var fontSans = (0, google_1.Inter)({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});
var fontHeading = (0, google_1.Poppins)({
    subsets: ['latin'],
    weight: ['600', '700'],
    variable: '--font-heading',
    display: 'swap',
});
exports.metadata = {
    title: 'Zeeky Social | Your Pulse on Real Content',
    description: 'A social experience built on real content, not algorithms. Discover music, videos, and communities that match your vibe.',
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en" suppressHydrationWarning>
      <body className={(0, utils_1.cn)('min-h-screen bg-deep-space font-sans text-white antialiased', fontSans.variable, fontHeading.variable)}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <FloatingDock_1.default />
        </div>
      </body>
    </html>);
}
