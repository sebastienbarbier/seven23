if(!self.define){let e,s={};const i=(i,a)=>(i=new URL(i+".js",a).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(a,r)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let c={};const o=e=>i(e,n),d={module:{uri:n},exports:c,require:o};s[n]=Promise.all(a.map((e=>d[e]||o(e)))).then((e=>(r(...e),c)))}}define(["./workbox-d249b2c8"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"Accounts.worker.841cd2b45af42ac8ae5d.worker.js",revision:null},{url:"Categories.worker.dd63888b767231e4c6ff.worker.js",revision:null},{url:"Changes.worker.4cd0918b5ab5dcee0903.worker.js",revision:null},{url:"Statistics.worker.aa0995bcc7d48caffc95.worker.js",revision:null},{url:"Transactions.worker.2ae8360992c4a8a039c3.worker.js",revision:null},{url:"app.js",revision:"663e6c31edf6ec4bfb8ea881cff37100"},{url:"images/icons/android-chrome-192x192.png",revision:"819df6e99a8a91e6f6b254a2f2b8e3c4"},{url:"images/icons/android-chrome-512x512.png",revision:"f470fe05120716ad350bda7b16eab837"},{url:"images/icons/apple-touch-icon.png",revision:"fd57ff6cd0d366890f8694b9d8374028"},{url:"images/icons/browserconfig.xml",revision:"cf27381d0881e89f73fc9f0c8c8a4c60"},{url:"images/icons/favicon.svg",revision:"d9160141e75e1ad3c37f64ed9c9a0faf"},{url:"images/icons/mstile-144x144.png",revision:"f069aab368db82c06a197951491fabdc"},{url:"images/icons/mstile-150x150.png",revision:"845e80643d280cd0719fa2d13467c618"},{url:"images/icons/mstile-310x150.png",revision:"bfb8aff65a50d163cd6b80d221ad4bbd"},{url:"images/icons/mstile-310x310.png",revision:"b9cd98bc9f7658daadc705d307fa3885"},{url:"images/icons/mstile-70x70.png",revision:"1325d6e6129ba2f61fe26f1a90081303"},{url:"images/icons/safari-pinned-tab.svg",revision:"f7b95daf156247776611337f444608f1"},{url:"images/sebastienbarbier.svg",revision:"9d269fc252314301e63bc9f8bc70cf83"},{url:"images/seven23.svg",revision:"4664632f0f691a15ac5a37f679086512"},{url:"images/seven23_logo.svg",revision:"d5e4fe68afa2f0ca9f4e882e47d71e2e"},{url:"images/seven23_logo_white.svg",revision:"700facd52d8359854cc149970c3327e4"},{url:"images/seven23_round.svg",revision:"7ac0604a172516f598f3fab765529d8d"},{url:"images/seven23_square.svg",revision:"20b2601e76adf5e123630e5b798a67ed"},{url:"images/seven23_white.svg",revision:"71ed23b1a56128cc61830554949558b3"},{url:"images/splashscreens/ipad_splash.png",revision:"1cd8614e43375dcf621e98ed6653285a"},{url:"images/splashscreens/ipadpro1_splash.png",revision:"9a1ca3de38c7bad0b7848c9c99e88a51"},{url:"images/splashscreens/ipadpro2_splash.png",revision:"ef1b99fb8a45cc1fc881c38cd2592262"},{url:"images/splashscreens/ipadpro3_splash.png",revision:"13831b3497d8a994db4d50a5768137f2"},{url:"images/splashscreens/iphone5_splash.png",revision:"d9dba5c5b119f0453528704083983604"},{url:"images/splashscreens/iphone6_splash.png",revision:"7cbb979fdcb49ebd60d4892c78d51b67"},{url:"images/splashscreens/iphoneplus_splash.png",revision:"c932fcbf40f8434d0d3fd470141e2dae"},{url:"images/splashscreens/iphonex_splash.png",revision:"bdf35f98d4356bd3976b271bda8f436b"},{url:"images/splashscreens/iphonexr_splash.png",revision:"b28f2abce588a66a29829b145eba5acf"},{url:"images/splashscreens/iphonexsmax_splash.png",revision:"38abddf0efcfb36149a3f719793e2faf"},{url:"index.html",revision:"aa52bb64b3640470d537e7156f440eaa"}],{})}));
//# sourceMappingURL=service-worker.js.map
