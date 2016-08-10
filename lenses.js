/*
ramda is a library similar to lodash that also does a bunch more cool stuff
 */
const R = require("ramda");

/*
 The following structure will be used for lenses. Think of it is a type made through composition. A person contains
 a name, an address, and a picture
 */
const me = {
    name: "Ryan",
    address: {
        street: ["Awesome St."],
        city: "Plano",
        zip: 75023,
        state: "TX"
    },
    picture: {
        full: "/path/to/full.png",
        thumb: "/path/to/thumb.png"
    }
}

/*
 I will define lenses on a picture...
 */

const full = R.lensProp("full");
const thumb = R.lensProp("thumb");

/*
 An address using composition ...
 */
const zip = R.lensProp("zip");
const street1 = R.compose(R.lensProp("street"), R.lensIndex(0));

/*
 And finally a whole person by more composition
 */
const personName = R.lensProp("name");
const personThumb = R.compose(R.lensProp("picture"), thumb);
const personZip = R.compose(R.lensProp("address"), zip);
const personStreet1 = R.compose(R.lensProp("address"), street1);

/*
 * I can use lenses to access the value in a nested structure
 */
console.log("name: ", R.view(personName, me));
console.log("thumbnail: ", R.view(personThumb, me));

/*
Outputs...

name:  Ryan
thumbnail:  /path/to/thumb.png
*/

/*
 I can use lenses to "set" the value at a specific location. This returns a whole new structure with only the piece
 modified.
 */

const oldMe = R.set(personStreet1, "Ambivalent Street", me);
console.log(oldMe);
console.log(me);
/*
Outputs...
{ name: 'Ryan',
  address:
   { street: [ 'Ambivalent Street' ],
     city: 'Plano',
     zip: 75023,
     state: 'TX' },
  picture: { full: '/path/to/full.png', thumb: '/path/to/thumb.png' } }
{ name: 'Ryan',
  address:
   { street: [ 'Awesome St.' ],
     city: 'Plano',
     zip: 75023,
     state: 'TX' },
  picture: { full: '/path/to/full.png', thumb: '/path/to/thumb.png' } }
 */

/*
 Notice how the sub documents are reused and may be compared with equality
 */
console.log("the picture is shared between: ", oldMe.picture === me.picture);

/*
Outputs...

the picture is shared between:  true
*/

/*
 I can also use lenses to run functions against sub documents as a combination of get an set
 */

const movedMe = R.over(personZip, R.add(1), me);
console.log(movedMe.address.zip);

/*
 Outputs...

75024
*/
