import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { AuthUserGuard } from './auth-user.guard';

describe('AuthUserPredicateGuard', () => {
    let guard: AuthUserGuard;
    let routerSpy: jasmine.SpyObj<Router>;
    const serviceStub: Partial<AuthenticationService> = {};

    describe('Unauthenticated, without redirect', () => {
        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthUserGuard(serviceStub as AuthenticationService, routerSpy, undefined);
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
            serviceStub.notifyGuardBlockedAccess = (): void => {
                return;
            };
        });

        it('emits false when user is not authenticated', (done: DoneFn) => {
            guard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot).subscribe((res: UrlTree | boolean) => {
                expect(res).toBeFalse();
                done();
            });
        });
    });

    describe('Unauthenticated, with redirect', () => {
        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthUserGuard(serviceStub as AuthenticationService, routerSpy, '/error');
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
            serviceStub.notifyGuardBlockedAccess = (): void => {
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
                done();
            });
        });
    });

    describe('Authenticated', () => {
        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthUserGuard(serviceStub as AuthenticationService, routerSpy, undefined);
            serviceStub.getAuthenticationState = (): Observable<any> => of({ username: 'foo' });
            // TODO: Test this is called! Also elsewhere
            serviceStub.notifyGuardBlockedAccess = (): void => {
                return;
            };
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
