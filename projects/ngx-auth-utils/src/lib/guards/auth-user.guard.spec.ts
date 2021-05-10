import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { AuthUserGuard } from './auth-user.guard';

describe('AuthUserPredicateGuard', () => {
    let guard: AuthUserGuard;
    let routerSpy: jasmine.SpyObj<Router>;
    const serviceStub: Partial<AuthenticationService> = {};

    describe('Unauthenticated, without redirect', () => {
        let eventCalled = false;

        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthUserGuard(serviceStub as AuthenticationService, routerSpy, undefined);
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
            eventCalled = false;
            serviceStub.notifyGuardBlockedAccess = (): void => {
                eventCalled = true;
                return;
            };
        });

        it('emits false when user is not authenticated', (done: DoneFn) => {
            guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot).subscribe((res: UrlTree | boolean) => {
                expect(res).toBeFalse();
                expect(eventCalled).toBeTrue();
                done();
            });
        });
    });

    describe('Unauthenticated, with redirect', () => {
        let eventCalled = false;

        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthUserGuard(serviceStub as AuthenticationService, routerSpy, '/error');
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
            eventCalled = false;
            serviceStub.notifyGuardBlockedAccess = (): void => {
                eventCalled = true;
                return;
            };
        });

        it('redirects to configured URL when user is not authenticated', (done: DoneFn) => {
            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);

            guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot).subscribe((url: UrlTree | boolean) => {
                expect(url).toBeInstanceOf(UrlTree);
                expect(url).toEqual(dummyUrlTree);
                expect(routerSpy.parseUrl.calls.mostRecent().args).toEqual(['/error']);
                expect(eventCalled).toBeTrue();
                done();
            });
        });
    });

    describe('Authenticated', () => {
        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthUserGuard(serviceStub as AuthenticationService, routerSpy, undefined);
            serviceStub.getAuthenticationState = (): Observable<any> => of({ username: 'foo' });
        });

        it('emits true when user is authenticated', (done: DoneFn) => {
            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);

            guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot).subscribe((res: UrlTree | boolean) => {
                expect(res).toBeTrue();
                done();
            });
        });
    });
});
