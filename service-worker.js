if(!self.define){let e,s={};const i=(i,a)=>(i=new URL(i+".js",a).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(a,r)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let o={};const c=e=>i(e,n),d={module:{uri:n},exports:o,require:c};s[n]=Promise.all(a.map((e=>d[e]||c(e)))).then((e=>(r(...e),o)))}}define(["./workbox-2b403519"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"Accounts.worker.ec8b4b42de8dc33e491a.worker.js",revision:null},{url:"Categories.worker.435704b206e5264f0aef.worker.js",revision:null},{url:"Changes.worker.c73f3a9eb73ad5191f97.worker.js",revision:null},{url:"Statistics.worker.6a3afc261df57c7f9354.worker.js",revision:null},{url:"Transactions.worker.635516986c982b45f00b.worker.js",revision:null},{url:"images/icons-dev/android-chrome-192x192.png",revision:"0a6a3682c0a7103fbf17e21028e8a244"},{url:"images/icons-dev/android-chrome-512x512.png",revision:"2b605df0676bf20e43513904f9110b18"},{url:"images/icons-dev/apple-touch-icon.png",revision:"cc38be65a4e0677b43f2752db9163d10"},{url:"images/icons-dev/browserconfig.xml",revision:"a1f168f0e3083abf783d5aebe30ede03"},{url:"images/icons-dev/favicon.svg",revision:"d9160141e75e1ad3c37f64ed9c9a0faf"},{url:"images/icons-dev/mstile-144x144.png",revision:"ffa06bd4ef84b8d3e1f817a0d244e02b"},{url:"images/icons-dev/mstile-150x150.png",revision:"455d5c31dfb8ba64e277078bcf107d30"},{url:"images/icons-dev/mstile-310x150.png",revision:"65a935e81bc374851ab44942f0209ce6"},{url:"images/icons-dev/mstile-310x310.png",revision:"b107023e983e92b15f96b5518bea50fb"},{url:"images/icons-dev/mstile-70x70.png",revision:"6169ce7dd04e10036f6d011393d71509"},{url:"images/icons-dev/safari-pinned-tab.svg",revision:"a25762320b646262628b728d1a1701d9"},{url:"images/icons/android-chrome-192x192.png",revision:"0a6a3682c0a7103fbf17e21028e8a244"},{url:"images/icons/android-chrome-512x512.png",revision:"2b605df0676bf20e43513904f9110b18"},{url:"images/icons/apple-touch-icon.png",revision:"cc38be65a4e0677b43f2752db9163d10"},{url:"images/icons/browserconfig.xml",revision:"a1f168f0e3083abf783d5aebe30ede03"},{url:"images/icons/favicon.svg",revision:"d9160141e75e1ad3c37f64ed9c9a0faf"},{url:"images/icons/mstile-144x144.png",revision:"ffa06bd4ef84b8d3e1f817a0d244e02b"},{url:"images/icons/mstile-150x150.png",revision:"455d5c31dfb8ba64e277078bcf107d30"},{url:"images/icons/mstile-310x150.png",revision:"65a935e81bc374851ab44942f0209ce6"},{url:"images/icons/mstile-310x310.png",revision:"b107023e983e92b15f96b5518bea50fb"},{url:"images/icons/mstile-70x70.png",revision:"6169ce7dd04e10036f6d011393d71509"},{url:"images/icons/safari-pinned-tab.svg",revision:"a25762320b646262628b728d1a1701d9"},{url:"images/sebastienbarbier.svg",revision:"9d269fc252314301e63bc9f8bc70cf83"},{url:"images/seven23.svg",revision:"4664632f0f691a15ac5a37f679086512"},{url:"images/seven23_logo.svg",revision:"d5e4fe68afa2f0ca9f4e882e47d71e2e"},{url:"images/seven23_logo_white.svg",revision:"700facd52d8359854cc149970c3327e4"},{url:"images/seven23_round.svg",revision:"7ac0604a172516f598f3fab765529d8d"},{url:"images/seven23_square.svg",revision:"eb6444b94a19dc6e4f00c5bdd9135610"},{url:"images/seven23_white.svg",revision:"71ed23b1a56128cc61830554949558b3"},{url:"images/splashscreens/ipad_splash.png",revision:"1cd8614e43375dcf621e98ed6653285a"},{url:"images/splashscreens/ipadpro1_splash.png",revision:"9a1ca3de38c7bad0b7848c9c99e88a51"},{url:"images/splashscreens/ipadpro2_splash.png",revision:"ef1b99fb8a45cc1fc881c38cd2592262"},{url:"images/splashscreens/ipadpro3_splash.png",revision:"13831b3497d8a994db4d50a5768137f2"},{url:"images/splashscreens/iphone5_splash.png",revision:"d9dba5c5b119f0453528704083983604"},{url:"images/splashscreens/iphone6_splash.png",revision:"7cbb979fdcb49ebd60d4892c78d51b67"},{url:"images/splashscreens/iphoneplus_splash.png",revision:"c932fcbf40f8434d0d3fd470141e2dae"},{url:"images/splashscreens/iphonex_splash.png",revision:"bdf35f98d4356bd3976b271bda8f436b"},{url:"images/splashscreens/iphonexr_splash.png",revision:"b28f2abce588a66a29829b145eba5acf"},{url:"images/splashscreens/iphonexsmax_splash.png",revision:"38abddf0efcfb36149a3f719793e2faf"},{url:"index.html",revision:"c24a4059f041fecb042da4e4c77de826"}],{})}));
//# sourceMappingURL=service-worker.js.map
