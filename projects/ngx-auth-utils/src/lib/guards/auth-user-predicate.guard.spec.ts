import { AuthUserPredicateGuard } from './auth-user-predicate.guard';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { catchError } from 'rxjs/operators';
import { AuthUserPredicates } from '../interfaces';

describe('AuthUserPredicateGuard', () => {
    let guard: AuthUserPredicateGuard;

    function fakeRouterState(url: string): RouterStateSnapshot {
        return {
            url,
        } as RouterStateSnapshot;
    }

    function createRouteSnapshotData(predicates?: Partial<AuthUserPredicates>): ActivatedRouteSnapshot {
        const dummyRoute = {
            data: {
                authUserPredicate: predicates,
            },
        } as unknown;

        return dummyRoute as ActivatedRouteSnapshot;
    }

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
        serviceStub = {};
        guard = new AuthUserPredicateGuard(serviceStub as AuthenticationService, routerSpy);
    });

    let routerSpy: jasmine.SpyObj<Router>;
    let serviceStub: Partial<AuthenticationService>;

    describe('Performs validation checks', () => {
        beforeEach(() => {
            serviceStub.getAuthenticationState = (): Observable<any> => of({ username: 'foo' });
        });

        it('throws error if no parameters are specified', (done: DoneFn) => {
            const dummyRoute = createRouteSnapshotData();
            guard
                .canActivate(dummyRoute, fakeRouterState('/test'))
                .pipe(
                    catchError((err) => {
                        expect(err).toEqual(Error('AuthUserPredicate guard missing parameters'));
                        done();
                        return EMPTY;
                    })
                )
                .subscribe();
        });

        it('throws error if condition is not specified', (done: DoneFn) => {
            const dummyRoute = createRouteSnapshotData({ attribute: 'hello', value: 'bye' });

            guard
                .canActivate(dummyRoute as ActivatedRouteSnapshot, fakeRouterState('/test'))
                .pipe(
                    catchError((err) => {
                        expect(err).toEqual(Error('AuthUserPredicate guard missing condition'));
                        done();
                        return EMPTY;
                    })
                )
                .subscribe();
        });

        it('throws error if attribute is not specified', (done: DoneFn) => {
            const dummyRoute = createRouteSnapshotData({ condition: 'eq', value: 'bye' });

            guard
                .canActivate(dummyRoute as ActivatedRouteSnapshot, fakeRouterState('/test'))
                .pipe(
                    catchError((err) => {
                        expect(err).toEqual(Error('AuthUserPredicate guard missing attribute'));
                        done();
                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });

    describe('Unauthenticated user', () => {
        let dummyRoute: ActivatedRouteSnapshot;
        let fakeState: RouterStateSnapshot;

        let eventCalled = false;

        beforeEach(() => {
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
            dummyRoute = createRouteSnapshotData({ condition: 'eq', value: 'bye', attribute: 'foo' });
            fakeState = fakeRouterState('/');
            eventCalled = false;
            serviceStub.notifyGuardBlockedAccess = (): void => {
                eventCalled = true;
                return;
            };
        });

        it('Resolves to false', (done: DoneFn) => {
            guard.canActivate(dummyRoute, fakeState).subscribe((result) => {
                expect(result).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });

        it('Redirects to global redirect route if set', (done: DoneFn) => {
            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);
            guard = new AuthUserPredicateGuard(serviceStub as AuthenticationService, routerSpy, '/test-error');

            guard.canActivate(dummyRoute, fakeState).subscribe((url) => {
                expect(url).toBeInstanceOf(UrlTree);
                expect(url).toEqual(dummyUrlTree);
                expect(eventCalled).toBeTrue();
                expect(routerSpy.parseUrl.calls.mostRecent().args).toEqual(['/test-error']);
                done();
            });
        });

        it('Redirects to local redirect route if set', (done: DoneFn) => {
            dummyRoute = createRouteSnapshotData({ condition: 'eq', value: 'bye', attribute: 'foo', redirectRoute: '/local-error' });

            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);
            guard = new AuthUserPredicateGuard(serviceStub as AuthenticationService, routerSpy);

            guard.canActivate(dummyRoute, fakeState).subscribe((url) => {
                expect(url).toBeInstanceOf(UrlTree);
                expect(url).toEqual(dummyUrlTree);
                expect(eventCalled).toBeTrue();
                expect(routerSpy.parseUrl.calls.mostRecent().args).toEqual(['/local-error']);
                done();
            });
        });

        it('Redirects to local redirect route if set and global set too', (done: DoneFn) => {
            dummyRoute = createRouteSnapshotData({ condition: 'eq', value: 'bye', attribute: 'foo', redirectRoute: '/local-error' });

            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);
            guard = new AuthUserPredicateGuard(serviceStub as AuthenticationService, routerSpy, '/test-error');

            guard.canActivate(dummyRoute, fakeState).subscribe((url) => {
                expect(url).toBeInstanceOf(UrlTree);
                expect(url).toEqual(dummyUrlTree);
                expect(eventCalled).toBeTrue();
                expect(routerSpy.parseUrl.calls.mostRecent().args).toEqual(['/local-error']);
                done();
            });
        });

        it('Does not redirect if global is set but local is false', (done: DoneFn) => {
            dummyRoute = createRouteSnapshotData({ condition: 'eq', value: 'bye', attribute: 'foo', redirectRoute: false });

            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);
            guard = new AuthUserPredicateGuard(serviceStub as AuthenticationService, routerSpy, '/test-error');

            guard.canActivate(dummyRoute, fakeState).subscribe((resolve) => {
                expect(resolve).toBeFalse();
                expect(eventCalled).toBeTrue();
                expect(routerSpy.parseUrl.calls.count()).toEqual(0);
                done();
            });
        });
    });

    describe('Authenticated user', () => {
        const user = { username: 'foo', email: 'foo@bar.com', groups: ['GRP1', 'GRP2'] };
        let fakeState: RouterStateSnapshot;
        let eventCalled = false;

        beforeEach(() => {
            serviceStub.getAuthenticationState = (): Observable<any> => of(user);
            fakeState = fakeRouterState('/');
            eventCalled = false;
            serviceStub.notifyGuardBlockedAccess = (): void => {
                eventCalled = true;
                return;
            };
        });

        it('Eq value emits true when values are the same', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'eq', attribute: 'username', value: 'foo' });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeTrue();
                expect(eventCalled).toBeFalse();
                done();
            });
        });

        it('Eq value emits false when values differ', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'eq', attribute: 'username', value: 'bar' });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });

        it('Ne value emits true when values are the same', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'ne', attribute: 'username', value: 'foo' });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });

        it('Ne value emits false when values differ', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'ne', attribute: 'username', value: 'bar' });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeTrue();
                expect(eventCalled).toBeFalse();
                done();
            });
        });

        it('Any value emits true when at least one value matches', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'any', attribute: 'groups', value: ['GRP1', 'GRP6'] });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeTrue();
                expect(eventCalled).toBeFalse();
                done();
            });
        });

        it('Any value emits false when no value matches', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'any', attribute: 'groups', value: ['GRP5', 'GRP6'] });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });

        it('All value emits true when all values matches', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'all', attribute: 'groups', value: ['GRP1', 'GRP2'] });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeTrue();
                expect(eventCalled).toBeFalse();
                done();
            });
        });

        it('All value emits false when not all values match', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'all', attribute: 'groups', value: ['GRP1', 'GRP3'] });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });

        it('None value emits true when none of the values match', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'none', attribute: 'groups', value: ['GRP4', 'GRP5'] });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeTrue();
                expect(eventCalled).toBeFalse();
                done();
            });
        });

        it('None value emits false when any values matches', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'none', attribute: 'groups', value: ['GRP1', 'GRP3'] });
            guard.canActivate(route, fakeState).subscribe((res) => {
                expect(res).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });

        it('Eq value emits true when can match', (done: DoneFn) => {
            const route = createRouteSnapshotData({ condition: 'eq', attribute: 'username', value: 'foo' });
            guard.canMatch(route as Route).subscribe((res) => {
                expect(res).toBeTrue();
                expect(eventCalled).toBeFalse();
                done();
            });
        });
    });
});
