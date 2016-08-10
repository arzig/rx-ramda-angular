require("angular");

const R = require("ramda");
const {Observable, Subject} = require("@reactivex/rxjs");

const bindTo = R.curry((path, values$, model) => values$.subscribe(v => {
    model[path] = v;
}));

const callbackToStream = R.curry((name, target) => {
    const subject = new Subject();
    target[name] = function () {
        subject.next(Array.prototype.slice.call(arguments, 0));
    }
    return subject;
});

const watchStream = R.curry((expr, $scope) =>
    Observable.create((observer) =>
        // Return the $scope expression which can be used as teardown logic
        $scope.$watch(expr, (nv, ov) => observer.next(nv))
    )
);

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

const valueLens = R.lensProp("value");
const textLens = R.lensProp("text");

angular.module("StateApp", [])
    .controller("StateController", ["$scope", function StateController($scope) {
        const state = stateStream({value: 0, text: ""});

        const inc$ = callbackToStream('inc', $scope).map(R.always(R.over(valueLens, R.add(1))));
        const dec$ = callbackToStream('dec', $scope).map(R.always(R.over(valueLens, R.add(-1)))); // -1 is easier than subtract
        const reset$ = callbackToStream('reset', $scope)
            .map(R.always(R.compose(
                R.set(valueLens, 0),
                R.set(textLens, "")
            )));

        const setText$ = watchStream('text', $scope)
            .filter(R.identity)
            .map(t => R.set(textLens, t)); // .map(R.set(textLens)) also works

        const bufferedText$ = state.value$.map(R.view(textLens))
            .distinct(R.equals)
            .merge(reset$.map(R.always(false)))
            .scan((acc, v) => v ? R.prepend(v, R.take(2, acc)) : [], []);

        $scope.inc5 = () => {
            state.update(R.over(valueLens, R.add(5)));
        }

        bindTo('value', state.value$.map(R.view(valueLens)), $scope);
        bindTo('bufferedText', bufferedText$, $scope);

        state.updateWith(inc$.merge(dec$).merge(reset$).merge(setText$));
    }]);
