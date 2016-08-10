require("angular");

const R = require("ramda");
const {Observable, Subject} = require("@reactivex/rxjs");

const bindTo = R.curry((path, values$, model) => values$.subscribe(v => {
    model[path] = v;
}));

const callToStream = R.curry((name, target) => {
    const subject = new Subject();
    target[name] = function () {
        subject.next(Array.prototype.slice.call(arguments, 0));
    }
    return subject;
});

const unsubscriber = (subscription) => () => {
    subscription.unsubscribe();
};

function stateStream(startValue) {
    const fn$ = new Subject();

    const value$ = Observable.of(startValue)
        .concat(fn$.scan((acc, fn) => fn(acc), startValue))
        .publishReplay(1);

    value$.connect();

    const updateWith = (update$) => update$.subscribe(
        fn => fn$.next(fn),
        e => console.error(e)
    );

    const update = fn => fn$.next(fn);

    return {
        value$,
        updateWith,
        update
    };
}

angular.module("StateApp", [])
    .controller("StateController", ["$scope", function StateController($scope) {
        const state = stateStream(0);

        const inc$ = callToStream('inc', $scope).map(R.always(R.add(1)));
        const dec$ = callToStream('dec', $scope).map(R.always(R.add(-1))); // -1 is easier than subtract
        const reset$ = callToStream('reset', $scope).map(R.always(R.always(0))); // Always return a function that returns 0

        $scope.inc5 = () => {
            state.update(R.add(5));
        }

        bindTo('value', state.value$, $scope);
        state.updateWith(inc$.merge(dec$).merge(reset$));
    }]);
