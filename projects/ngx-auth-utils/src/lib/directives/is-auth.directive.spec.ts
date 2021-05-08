import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { IsAuthDirective } from './is-auth.directive';
import { UserType } from '../interfaces';

@Component({
    template: `
        <div id="auth" *ngxAuth>Auth</div>
        <div id="anon" *ngxAuth="false">Anon</div>
        <div id="authCtx" *ngxAuth="true; user as u">{{ u.username }}</div>
    `,
})
export class TestComponent {}

describe('IsAuthDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let authService: jasmine.SpyObj<AuthenticationService>;

    // TODO: Move to utils
    function mockAuthState(user: UserType): void {
        const authState = new BehaviorSubject<UserType>(user);
        authService.getAuthenticationState.and.returnValue(authState.asObservable());
        fixture.detectChanges();
    }

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationService', ['getAuthenticationState']);

        fixture = TestBed.configureTestingModule({
            providers: [{ provide: AuthenticationService, useValue: authSpy }],
            declarations: [TestComponent, IsAuthDirective],
            schemas: [NO_ERRORS_SCHEMA],
        }).createComponent(TestComponent);

        authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    });

    it('shows contents if user is authenticated', () => {
        const user = { user: 'username' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#auth');
        const contents = div.textContent;
        expect(contents).toBe('Auth');
    });

    it('hides contents if user is not authenticated', () => {
        mockAuthState(null);

        const div: HTMLElement = fixture.nativeElement.querySelector('#auth');
        expect(div).toBeNull();
    });

    it('shows contents when user is not authenticated', () => {
        mockAuthState(null);

        const div: HTMLElement = fixture.nativeElement.querySelector('#anon');
        const contents = div.textContent;
        expect(contents).toBe('Anon');
    });

    it('hides contents when user is authenticated', () => {
        const user = { user: 'username' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#anon');
        expect(div).toBeNull();
    });

    it('user is correctly passed in directive context', () => {
        const user = { username: 'username' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#authCtx');
        const contents = div.textContent;
        expect(contents).toBe(user.username);
    });
});
