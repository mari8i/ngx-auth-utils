import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { AuthGuard } from './auth.guard';

describe('AuthUserPredicateGuard', () => {
    let guard: AuthGuard;
    let routerSpy: jasmine.SpyObj<Router>;
    const serviceStub: Partial<AuthenticationService> = {};

    describe('Unauthenticated, without redirect', () => {
        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthGuard(serviceStub as AuthenticationService, routerSpy, undefined);
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
        });

        it('emits false when user is not authenticated', (done: DoneFn) => {
            guard.canActivate().subscribe((res) => {
                expect(res).toBeFalse();
                done();
            });
        });
    });

    describe('Unauthenticated, with redirect', () => {
        beforeEach(() => {
            routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
            guard = new AuthGuard(serviceStub as AuthenticationService, routerSpy, '/error');
            serviceStub.getAuthenticationState = (): Observable<any> => of(null);
        });

        it('redirects to configured URL when user is not authenticated', (done: DoneFn) => {
            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);

            guard.canActivate().subscribe((url) => {
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
            guard = new AuthGuard(serviceStub as AuthenticationService, routerSpy, undefined);
            serviceStub.getAuthenticationState = (): Observable<any> => of({ username: 'foo' });
        });

        it('emits true when user is authenticated', (done: DoneFn) => {
            const dummyUrlTree: UrlTree = new UrlTree();
            routerSpy.parseUrl.and.returnValue(dummyUrlTree);

            guard.canActivate().subscribe((res) => {
                expect(res).toBeTrue();
                done();
            });
        });
    });
});
