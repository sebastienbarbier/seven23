if(!self.define){let e,s={};const i=(i,a)=>(i=new URL(i+".js",a).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(a,n)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let o={};const d=e=>i(e,r),c={module:{uri:r},exports:o,require:d};s[r]=Promise.all(a.map((e=>c[e]||d(e)))).then((e=>(n(...e),o)))}}define(["./workbox-717fa00d"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"Accounts.worker.83e0ff5ed8f6181d3196.worker.js",revision:null},{url:"Categories.worker.d5499ba008ba1ab0fc04.worker.js",revision:null},{url:"Changes.worker.71720bd140d37a6e47b1.worker.js",revision:null},{url:"Statistics.worker.0776bdddbed56194a3d1.worker.js",revision:null},{url:"Transactions.worker.8bebd5207fea2766a922.worker.js",revision:null},{url:"app.js",revision:"d313f8c9a8d682fca9d677288e2224cb"},{url:"images/how-to-install/android/1-chrome.png",revision:"629b2ed588d1312fcb29123478089517"},{url:"images/how-to-install/android/2-menu.png",revision:"826c09007f8975b59c0fd1653639b6be"},{url:"images/how-to-install/android/3-add.png",revision:"94e8385956518621ffb8ef70b4705738"},{url:"images/how-to-install/android/4-confirm.png",revision:"94fae3a9a26ef16475f6c0b8cde000c8"},{url:"images/how-to-install/android/5-open.png",revision:"57033257e9373ad608b5532dc72b0f9f"},{url:"images/how-to-install/ios/1-safari.png",revision:"3cc56b08a750aa3a2d6ddab2f6a9855e"},{url:"images/how-to-install/ios/2-share.png",revision:"33de7b69253f265a4a83dc56f18184df"},{url:"images/how-to-install/ios/3-add.png",revision:"40f5d1c0507215cd1ca580c2c74be69c"},{url:"images/how-to-install/ios/4-confirm.png",revision:"3c69cec48c07ed3a164582a8a5f69ce2"},{url:"images/how-to-install/ios/5-open.png",revision:"f52af8ad44f7bc29fae16a1a0922617f"},{url:"images/icons-dev/android-chrome-192x192.png",revision:"0a6a3682c0a7103fbf17e21028e8a244"},{url:"images/icons-dev/android-chrome-512x512.png",revision:"2b605df0676bf20e43513904f9110b18"},{url:"images/icons-dev/apple-touch-icon.png",revision:"cc38be65a4e0677b43f2752db9163d10"},{url:"images/icons-dev/browserconfig.xml",revision:"a1f168f0e3083abf783d5aebe30ede03"},{url:"images/icons-dev/favicon.svg",revision:"d9160141e75e1ad3c37f64ed9c9a0faf"},{url:"images/icons-dev/mstile-144x144.png",revision:"ffa06bd4ef84b8d3e1f817a0d244e02b"},{url:"images/icons-dev/mstile-150x150.png",revision:"455d5c31dfb8ba64e277078bcf107d30"},{url:"images/icons-dev/mstile-310x150.png",revision:"65a935e81bc374851ab44942f0209ce6"},{url:"images/icons-dev/mstile-310x310.png",revision:"b107023e983e92b15f96b5518bea50fb"},{url:"images/icons-dev/mstile-70x70.png",revision:"6169ce7dd04e10036f6d011393d71509"},{url:"images/icons-dev/safari-pinned-tab.svg",revision:"a25762320b646262628b728d1a1701d9"},{url:"images/icons/android-chrome-192x192.png",revision:"0a6a3682c0a7103fbf17e21028e8a244"},{url:"images/icons/android-chrome-512x512.png",revision:"2b605df0676bf20e43513904f9110b18"},{url:"images/icons/apple-touch-icon.png",revision:"cc38be65a4e0677b43f2752db9163d10"},{url:"images/icons/browserconfig.xml",revision:"a1f168f0e3083abf783d5aebe30ede03"},{url:"images/icons/favicon.svg",revision:"d9160141e75e1ad3c37f64ed9c9a0faf"},{url:"images/icons/mstile-144x144.png",revision:"ffa06bd4ef84b8d3e1f817a0d244e02b"},{url:"images/icons/mstile-150x150.png",revision:"455d5c31dfb8ba64e277078bcf107d30"},{url:"images/icons/mstile-310x150.png",revision:"65a935e81bc374851ab44942f0209ce6"},{url:"images/icons/mstile-310x310.png",revision:"b107023e983e92b15f96b5518bea50fb"},{url:"images/icons/mstile-70x70.png",revision:"6169ce7dd04e10036f6d011393d71509"},{url:"images/icons/safari-pinned-tab.svg",revision:"a25762320b646262628b728d1a1701d9"},{url:"images/sebastienbarbier.svg",revision:"9d269fc252314301e63bc9f8bc70cf83"},{url:"images/seven23.svg",revision:"4664632f0f691a15ac5a37f679086512"},{url:"images/seven23_logo.svg",revision:"d5e4fe68afa2f0ca9f4e882e47d71e2e"},{url:"images/seven23_logo_white.svg",revision:"700facd52d8359854cc149970c3327e4"},{url:"images/seven23_round.svg",revision:"7ac0604a172516f598f3fab765529d8d"},{url:"images/seven23_square.svg",revision:"eb6444b94a19dc6e4f00c5bdd9135610"},{url:"images/seven23_white.svg",revision:"71ed23b1a56128cc61830554949558b3"},{url:"images/splashscreens/ipad_splash.png",revision:"1cd8614e43375dcf621e98ed6653285a"},{url:"images/splashscreens/ipadpro1_splash.png",revision:"9a1ca3de38c7bad0b7848c9c99e88a51"},{url:"images/splashscreens/ipadpro2_splash.png",revision:"ef1b99fb8a45cc1fc881c38cd2592262"},{url:"images/splashscreens/ipadpro3_splash.png",revision:"13831b3497d8a994db4d50a5768137f2"},{url:"images/splashscreens/iphone5_splash.png",revision:"d9dba5c5b119f0453528704083983604"},{url:"images/splashscreens/iphone6_splash.png",revision:"7cbb979fdcb49ebd60d4892c78d51b67"},{url:"images/splashscreens/iphoneplus_splash.png",revision:"c932fcbf40f8434d0d3fd470141e2dae"},{url:"images/splashscreens/iphonex_splash.png",revision:"bdf35f98d4356bd3976b271bda8f436b"},{url:"images/splashscreens/iphonexr_splash.png",revision:"b28f2abce588a66a29829b145eba5acf"},{url:"images/splashscreens/iphonexsmax_splash.png",revision:"38abddf0efcfb36149a3f719793e2faf"},{url:"index.html",revision:"5350277a436589110f29f516d6d96378"}],{}),e.registerRoute(/.*\.(?:png|jpg|jpeg|svg|gif)/,new e.CacheFirst({cacheName:"images",plugins:[new e.ExpirationPlugin({maxEntries:10})]}),"GET")}));
//# sourceMappingURL=service-worker.js.map
