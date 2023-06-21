!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t=(new Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="6e58662f-5120-46b4-bce0-d104026d2334",e._sentryDebugIdIdentifier="sentry-dbid-6e58662f-5120-46b4-bce0-d104026d2334")}catch(e){}}();var _global="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};_global.SENTRY_RELEASE={id:"00fa482da67aca65c35c51d28dfeda6830c87349"},(()=>{"use strict";function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}var t=/[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;function a(a){if("string"==typeof a){if(t.test(a)){var n=a.slice(0,4),s=a.slice(5,7),r=a.slice(8,10);return new Date(n,s-1,r)}throw new Error("String '".concat(a,"' is not a valide date format (YYYY-MM-DD)"))}if(a instanceof Date)return a;throw new Error("Type ".concat(e(a)," is not handled by Utils.date.stringToDate()"))}function n(e,t){var a=(new Date).getFullYear(),n=(new Date).getMonth(),s=r(e.filter((e=>e.date.getFullYear()===a)),t),o=e.filter((e=>e.date.getFullYear()===a&&e.date.getMonth()===n));return s.currentMonth=r(o,t),s}function s(e,t=30){let a={};var n=new Date,s=new Date(n.getFullYear(),n.getMonth(),n.getDate())-864e5*(t+1),r=new Date(n.getFullYear(),n.getMonth(),n.getDate())-864e5;e.filter((e=>e.date>=s&&e.date<=r)).forEach((e=>{e.amount<0&&(e.category||(e.category=0),a[e.category]||(a[e.category]={earliest:0,oldiest:0}),a[e.category].earliest=a[e.category].earliest+e.amount)}));var o=new Date(n.getFullYear(),n.getMonth(),n.getDate())-864e5*(2*t+2),c=new Date(n.getFullYear(),n.getMonth(),n.getDate())-864e5*(t+2);e.filter((e=>e.date>=o&&e.date<=c)).forEach((e=>{e.amount<0&&(e.category||(e.category=0),a[e.category]||(a[e.category]={earliest:0,oldiest:0}),a[e.category].oldiest=a[e.category].oldiest+e.amount)}));let i=[],u=0,l=0,d=0;return Object.keys(a).forEach((e=>{i.push({id:e,diff:a[e].oldiest-a[e].earliest,earliest:a[e].earliest,oldiest:a[e].oldiest}),u+=a[e].oldiest-a[e].earliest,l+=a[e].earliest,d+=a[e].oldiest})),i=i.sort(((e,t)=>e.diff<t.diff?1:-1)),{diff:u,firstRange:{dateBegin:s,dateEnd:r,sum:l},secondRange:{dateBegin:o,dateEnd:c,sum:d},trend:i}}function r(e=[],t={}){let a=0,n=0,s={},r={},o=!1,c=null,i=null;e.forEach((e=>{null!=e.amount&&null!=e.amount||(o=!0),c||(c=e.date,i=e.date),e.category&&!s[e.category]&&(s[e.category]={expenses:0,incomes:0,counter:0}),null!=e.category||s.null||(s.null={expenses:0,incomes:0,counter:0}),e.date<c?c=e.date:e.date>i&&(i=e.date),r[e.date.getFullYear()]||(r[e.date.getFullYear()]={expenses:0,incomes:0,counter:0,months:{}}),r[e.date.getFullYear()].months[e.date.getMonth()]||(r[e.date.getFullYear()].months[e.date.getMonth()]={expenses:0,incomes:0,counter:0,days:{}}),r[e.date.getFullYear()].months[e.date.getMonth()].days[e.date.getDate()]||(r[e.date.getFullYear()].months[e.date.getMonth()].days[e.date.getDate()]={expenses:0,incomes:0,counter:0});const t=r[e.date.getFullYear()];t.counter+=1,e.amount>=0?(n+=e.amount,t.incomes+=e.amount,t.months[e.date.getMonth()].incomes+=e.amount,t.months[e.date.getMonth()].counter+=1,t.months[e.date.getMonth()].days[e.date.getDate()].incomes+=e.amount,t.months[e.date.getMonth()].days[e.date.getDate()].counter+=1,e.category?s[e.category].incomes+=e.amount:s.null.incomes+=e.amount):(a+=e.amount,t.expenses+=e.amount,t.months[e.date.getMonth()].expenses+=e.amount,t.months[e.date.getMonth()].counter+=1,t.months[e.date.getMonth()].days[e.date.getDate()].expenses+=e.amount,t.months[e.date.getMonth()].days[e.date.getDate()].counter+=1,e.category?s[e.category].expenses+=e.amount:s.null.expenses+=e.amount)}));let u=[];if(t.begin&&t.end||c&&i){let e=t.begin||c,a=t.end||i;for(;e.getTime()<=a.getTime();){const t=e.getUTCFullYear(),a=e.getUTCMonth(),n=e.getUTCDate();r[t]?.months[a]?.days[n]?u.push({date:new Date(Date.UTC(t,a,n)),amount:r[t].months[a].days[n].expenses}):u.push({date:new Date(Date.UTC(t,a,n)),amount:0}),e=new Date(e.getTime()+864e5)}}return{beginDate:c,endDate:i,incomes:n,expenses:a,hasUnknownAmount:o,calendar:u,perDates:r,perCategories:s,perCategoriesArray:Object.keys(s).map((e=>({id:e,incomes:s[e].incomes,expenses:s[e].expenses}))).sort(((e,t)=>e.incomes+e.expenses>t.incomes+t.expenses?1:-1))}}function o(e){let t={label:"Expenses",values:[]},a={label:"Incomes",values:[]};return Object.keys(e.perDates).forEach((n=>{Object.keys(e.perDates[n].months).forEach((s=>{e.perDates[n].months[s]?(t.values.push({date:new Date(n,s),value:-1*+e.perDates[n].months[s].expenses}),a.values.push({date:new Date(n,s),value:e.perDates[n].months[s].incomes})):(t.values.push({date:new Date(n,s),value:0}),a.values.push({date:new Date(n,s),value:0}))}))})),[t,a]}onmessage=function(e){var t=e.data;const{uuid:c}=t;var{transactions:i,nomadlist:u,begin:l,end:d,category:g,categoriesToExclude:y}=t,p=[];switch(i||(i=[]),i.forEach((e=>{e.date=a(e.date)})),t.type){case"STATISTICS_DASHBOARD":{const e=r(p=i,t);postMessage({uuid:c,type:t.type,transactions:p,currentYear:n(i,t),trend7:s(i,7),trend30:s(i,30),stats:e,graph:o(e)});break}case"STATISTICS_VIEWER":p=i.filter((e=>e.date>=l&&e.date<=d)),postMessage({uuid:c,type:t.type,transactions:p,currentYear:n(i,t),stats:r(p,t)});break;case"STATISTICS_PER_DATE":p=i.filter((e=>e.date>=l&&e.date<=d)),postMessage({uuid:c,type:t.type,transactions:p,stats:r(p,t)});break;case"STATISTICS_PER_CATEGORY":p=i.filter((e=>"null"==g&&null==e.category||e.category===g)),postMessage({uuid:c,type:t.type,transactions:p,stats:r(p,t)});break;case"STATISTICS_SEARCH":p=i.filter((e=>function(e,t){var a=t.toLowerCase();e=e.toLowerCase();for(var n=0,s=0;s<t.length;s++)a[s]===e[n]&&(n+=1);return n===e.length}(t.text||"",e.name))),postMessage({uuid:c,type:t.type,transactions:p,stats:r(p,t)});break;case"STATISTICS_NOMADLIST":{const e=function(e,t){const n={cities:{},countries:{}},s=new Date;return e.data.trips.forEach((e=>{const o=a(e.date_start),c=a(e.date_end);if(c<=s&&(e.transactions=t.filter((e=>e.date>=o&&e.date<=c)),e.transactions.length)){const t=`${e.place}-${e.country_code}`;n.cities[t]||(n.cities[t]={country:e.country,country_code:e.country_code,country_slug:e.country_slug,place:e.place,place_slug:e.place_slug,averageStay:0,averageExpenses:0,averagePerDay:0,averagePerMonth:0,stay:0,transactions_length:0,trips:[]}),n.countries[e.country_code]||(n.countries[e.country_code]={country:e.country,country_code:e.country_code,country_slug:e.country_slug,averageStay:0,averageExpenses:0,averagePerDay:0,averagePerMonth:0,stay:0,transactions_length:0,trips:[]}),e.stats=r(e.transactions),e.stay=Math.ceil(Math.abs(o-c)/864e5),0==e.stay&&(e.stay=1),e.perDay=e.stats.expenses/e.stay,e.perMonth=365.25*e.stats.expenses/e.stay/12,n.cities[t].stay+=e.stay,n.cities[t].transactions_length+=e.transactions.length,n.cities[t].trips.push(e),n.cities[t].averageStay+=e.stay,n.cities[t].averageExpenses+=e.stats.expenses,n.cities[t].averagePerDay+=e.perDay,n.cities[t].averagePerMonth+=e.perMonth,n.countries[e.country_code].stay+=e.stay,n.countries[e.country_code].transactions_length+=e.transactions.length,n.countries[e.country_code].trips.push(e),n.countries[e.country_code].averageStay+=e.stay,n.countries[e.country_code].averageExpenses+=e.stats.expenses,n.countries[e.country_code].averagePerDay+=e.perDay,n.countries[e.country_code].averagePerMonth+=e.perMonth}})),Object.values(n.cities).forEach((e=>{e.averageStay=e.averageStay/e.trips.length,e.averageExpenses=e.averageExpenses/e.trips.length,e.averagePerDay=e.averagePerDay/e.trips.length,e.averagePerMonth=e.averagePerMonth/e.trips.length})),Object.values(n.countries).forEach((e=>{e.averageStay=e.averageStay/e.trips.length,e.averageExpenses=e.averageExpenses/e.trips.length,e.averagePerDay=e.averagePerDay/e.trips.length,e.averagePerMonth=e.averagePerMonth/e.trips.length})),{cities:Object.values(n.cities),countries:Object.values(n.countries)}}(u,p=i.filter((e=>-1==y.indexOf(e.category))));postMessage({uuid:c,type:t.type,cities:e.cities,countries:e.countries});break}default:return}}})();
//# sourceMappingURL=Statistics.worker.e1beeb31cdb7ffc7e277.worker.js.map