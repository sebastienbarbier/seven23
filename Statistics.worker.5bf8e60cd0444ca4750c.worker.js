(()=>{"use strict";function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}var t=/[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;function a(a){if("string"==typeof a){if(t.test(a)){var s=a.slice(0,4),n=a.slice(5,7),r=a.slice(8,10);return new Date(s,n-1,r)}throw new Error("String '".concat(a,"' is not a valide date format (YYYY-MM-DD)"))}if(a instanceof Date)return a;throw new Error("Type ".concat(e(a)," is not handled by Utils.date.stringToDate()"))}function s(e,t){var a=(new Date).getFullYear(),s=(new Date).getMonth(),n=r(e.filter((e=>e.date.getFullYear()===a)),t),o=e.filter((e=>e.date.getFullYear()===a&&e.date.getMonth()===s));return n.currentMonth=r(o,t),n}function n(e,t=30){let a={};var s=new Date,n=new Date(s.getFullYear(),s.getMonth(),s.getDate())-864e5*(t+1),r=new Date(s.getFullYear(),s.getMonth(),s.getDate())-864e5;e.filter((e=>e.date>=n&&e.date<=r)).forEach((e=>{e.amount<0&&(e.category||(e.category=0),a[e.category]||(a[e.category]={earliest:0,oldiest:0}),a[e.category].earliest=a[e.category].earliest+e.amount)}));var o=new Date(s.getFullYear(),s.getMonth(),s.getDate())-864e5*(2*t+2),c=new Date(s.getFullYear(),s.getMonth(),s.getDate())-864e5*(t+2);e.filter((e=>e.date>=o&&e.date<=c)).forEach((e=>{e.amount<0&&(e.category||(e.category=0),a[e.category]||(a[e.category]={earliest:0,oldiest:0}),a[e.category].oldiest=a[e.category].oldiest+e.amount)}));let i=[],u=0,g=0,l=0;return Object.keys(a).forEach((e=>{i.push({id:e,diff:a[e].oldiest-a[e].earliest,earliest:a[e].earliest,oldiest:a[e].oldiest}),u+=a[e].oldiest-a[e].earliest,g+=a[e].earliest,l+=a[e].oldiest})),i=i.sort(((e,t)=>e.diff<t.diff?1:-1)),{diff:u,firstRange:{dateBegin:n,dateEnd:r,sum:g},secondRange:{dateBegin:o,dateEnd:c,sum:l},trend:i}}function r(e=[],t={}){let a=0,s=0,n={},r={},o=!1,c=null,i=null;e.forEach((e=>{null!=e.amount&&null!=e.amount||(o=!0),c||(c=e.date,i=e.date),e.category&&!n[e.category]&&(n[e.category]={expenses:0,incomes:0,counter:0}),e.date<c?c=e.date:e.date>i&&(i=e.date),r[e.date.getFullYear()]||(r[e.date.getFullYear()]={expenses:0,incomes:0,counter:0,months:{}}),r[e.date.getFullYear()].months[e.date.getMonth()]||(r[e.date.getFullYear()].months[e.date.getMonth()]={expenses:0,incomes:0,counter:0,days:{}}),r[e.date.getFullYear()].months[e.date.getMonth()].days[e.date.getDate()]||(r[e.date.getFullYear()].months[e.date.getMonth()].days[e.date.getDate()]={expenses:0,incomes:0,counter:0});const t=r[e.date.getFullYear()];t.counter+=1,e.amount>=0?(s+=e.amount,t.incomes+=e.amount,t.months[e.date.getMonth()].incomes+=e.amount,t.months[e.date.getMonth()].counter+=1,t.months[e.date.getMonth()].days[e.date.getDate()].incomes+=e.amount,t.months[e.date.getMonth()].days[e.date.getDate()].counter+=1,e.category&&(n[e.category].incomes+=e.amount)):(a+=e.amount,t.expenses+=e.amount,t.months[e.date.getMonth()].expenses+=e.amount,t.months[e.date.getMonth()].counter+=1,t.months[e.date.getMonth()].days[e.date.getDate()].expenses+=e.amount,t.months[e.date.getMonth()].days[e.date.getDate()].counter+=1,e.category&&(n[e.category].expenses+=e.amount))}));let u=[];if(t.begin&&t.end||c&&i){let e=t.begin||c,a=t.end||i;for(;e.getTime()<=a.getTime();){const t=e.getUTCFullYear(),a=e.getUTCMonth(),s=e.getUTCDate();r[t]?.months[a]?.days[s]?u.push({date:new Date(Date.UTC(t,a,s)),amount:r[t].months[a].days[s].expenses}):u.push({date:new Date(Date.UTC(t,a,s)),amount:0}),e=new Date(e.getTime()+864e5)}}return{beginDate:c,endDate:i,incomes:s,expenses:a,hasUnknownAmount:o,calendar:u,perDates:r,perCategories:n,perCategoriesArray:Object.keys(n).map((e=>({id:e,incomes:n[e].incomes,expenses:n[e].expenses}))).sort(((e,t)=>e.incomes+e.expenses>t.incomes+t.expenses?1:-1))}}function o(e){let t={values:[]},a={values:[]};return Object.keys(e.perDates).forEach((s=>{Object.keys(e.perDates[s].months).forEach((n=>{e.perDates[s].months[n]?(t.values.push({date:new Date(s,n),value:-1*+e.perDates[s].months[n].expenses}),a.values.push({date:new Date(s,n),value:e.perDates[s].months[n].incomes})):(t.values.push({date:new Date(s,n),value:0}),a.values.push({date:new Date(s,n),value:0}))}))})),[t,a]}onmessage=function(e){var t=e.data;const{uuid:c}=t;var{transactions:i,nomadlist:u,begin:g,end:l,category:d,categoriesToExclude:y}=t,p=[];switch(i||(i=[]),i.forEach((e=>{e.date=a(e.date)})),t.type){case"STATISTICS_DASHBOARD":{const e=r(p=i,t);postMessage({uuid:c,type:t.type,transactions:p,currentYear:s(i,t),trend7:n(i,7),trend30:n(i,30),stats:e,graph:o(e)});break}case"STATISTICS_VIEWER":p=i.filter((e=>e.date>=g&&e.date<=l)),postMessage({uuid:c,type:t.type,transactions:p,currentYear:s(i,t),stats:r(p,t)});break;case"STATISTICS_PER_DATE":p=i.filter((e=>e.date>=g&&e.date<=l)),postMessage({uuid:c,type:t.type,transactions:p,stats:r(p,t)});break;case"STATISTICS_PER_CATEGORY":p=i.filter((e=>e.category===d)),postMessage({uuid:c,type:t.type,transactions:p,stats:r(p,t)});break;case"STATISTICS_SEARCH":p=i.filter((e=>function(e,t){var a=t.toLowerCase();e=e.toLowerCase();for(var s=0,n=0;n<t.length;n++)a[n]===e[s]&&(s+=1);return s===e.length}(t.text||"",e.name))),postMessage({uuid:c,type:t.type,transactions:p,stats:r(p,t)});break;case"STATISTICS_NOMADLIST":{const e=function(e,t){const s={cities:{},countries:{}},n=new Date;return e.data.trips.forEach((e=>{const o=a(e.date_start),c=a(e.date_end);if(c<=n&&(e.transactions=t.filter((e=>e.date>=o&&e.date<=c)),e.transactions.length)){const t=`${e.place}-${e.country_code}`;s.cities[t]||(s.cities[t]={country:e.country,country_code:e.country_code,country_slug:e.country_slug,place:e.place,place_slug:e.place_slug,averageStay:0,averageExpenses:0,averagePerDay:0,averagePerMonth:0,stay:0,transactions_length:0,trips:[]}),s.countries[e.country_code]||(s.countries[e.country_code]={country:e.country,country_code:e.country_code,country_slug:e.country_slug,averageStay:0,averageExpenses:0,averagePerDay:0,averagePerMonth:0,stay:0,transactions_length:0,trips:[]}),e.stats=r(e.transactions),e.stay=Math.ceil(Math.abs(o-c)/864e5),0==e.stay&&(e.stay=1),e.perDay=e.stats.expenses/e.stay,e.perMonth=365.25*e.stats.expenses/e.stay/12,s.cities[t].stay+=e.stay,s.cities[t].transactions_length+=e.transactions.length,s.cities[t].trips.push(e),s.cities[t].averageStay+=e.stay,s.cities[t].averageExpenses+=e.stats.expenses,s.cities[t].averagePerDay+=e.perDay,s.cities[t].averagePerMonth+=e.perMonth,s.countries[e.country_code].stay+=e.stay,s.countries[e.country_code].transactions_length+=e.transactions.length,s.countries[e.country_code].trips.push(e),s.countries[e.country_code].averageStay+=e.stay,s.countries[e.country_code].averageExpenses+=e.stats.expenses,s.countries[e.country_code].averagePerDay+=e.perDay,s.countries[e.country_code].averagePerMonth+=e.perMonth}})),Object.values(s.cities).forEach((e=>{e.averageStay=e.averageStay/e.trips.length,e.averageExpenses=e.averageExpenses/e.trips.length,e.averagePerDay=e.averagePerDay/e.trips.length,e.averagePerMonth=e.averagePerMonth/e.trips.length})),Object.values(s.countries).forEach((e=>{e.averageStay=e.averageStay/e.trips.length,e.averageExpenses=e.averageExpenses/e.trips.length,e.averagePerDay=e.averagePerDay/e.trips.length,e.averagePerMonth=e.averagePerMonth/e.trips.length})),{cities:Object.values(s.cities),countries:Object.values(s.countries)}}(u,p=i.filter((e=>-1==y.indexOf(e.category))));postMessage({uuid:c,type:t.type,cities:e.cities,countries:e.countries});break}default:return}}})();
//# sourceMappingURL=Statistics.worker.5bf8e60cd0444ca4750c.worker.js.map