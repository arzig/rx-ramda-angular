const R = require("ramda");
const Promise = require("bluebird");
const {Observable, Subject} = require("@reactivex/rxjs");

/*
 Observables are the push based equivalent of Enumerables (from C#). Think of them as sequences in time as opposed
 to sequences in space the way arrays are. Many lodash analogs have equivalents in observables like map, reduce,
 filter, and flatten (mergeMap, switchMap, exhaustMap depending on the precise behavior desired)
 */

const isEven = v => v % 2 === 0;
const print = v => console.log(v);

/* Using map and filter */
Observable.from(R.range(0, 100)) // from is kind of like Promise.resolve/Q.when
    .map(R.add(2))
    .skip(90)
    .filter(isEven)
    .subscribe(print, print); // Observables are different from promises in that no work is done until subscribe is called somewhere

/*
Outputs...

92
94
96
98
100
*/

/*
 Observables can chain together similarly to promises as well as operate asynchronously, however you can also interleave
 the 'collection' combinators.
 For instance, read package.json and .gitignore from the current directly and uppercase them both then smash them
 together into a single string.
 */
const fs = require("fs");
const readFile = (p) => Observable.create(observer => {
    fs.readFile(p, {encoding: "utf8"}, (err, content) => {
        if (err) {
            observer.error(err);
        } else {
            observer.next(content);
            observer.complete();
        }
    });
});

Observable.from(["package.json", ".gitignore"])
    .mergeMap(readFile, 1)
    .map(R.toUpper)
    .reduce((acc, s) => acc + "***\n" + s)
    .map(s => `+++\n${s}---`)
    .subscribe(print, print);

/*
Outputs...

 +++
 {
   "NAME": "TINY-EXAMPLES",
   "VERSION": "1.0.0",
   "DESCRIPTION": "EXAMPLES OF RX AND LENSES",
   "MAIN": "INDEX.JS",
   "SCRIPTS": {
     "TEST": "ECHO \"ERROR: NO TEST SPECIFIED\" && EXIT 1"
   },
   "AUTHOR": "",
   "LICENSE": "ISC",
   "DEPENDENCIES": {
     "@REACTIVEX/RXJS": "^5.0.0-BETA.11",
     "BLUEBIRD": "^3.4.1",
     "RAMDA": "^0.22.1"
   }
 }
 ***
 NODE_MODULES/
 ---
 */
