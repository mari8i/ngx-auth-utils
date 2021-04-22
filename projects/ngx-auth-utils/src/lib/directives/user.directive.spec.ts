import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { UserDirective } from './user.directive';

@Component({
    template: `
        <div id="auth" *ngxAuth>Auth</div>
        <div id="anon" *ngxAuth="false">Anon</div>
    `,
})
export class TestComponent {}

describe('UserDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let authService: jasmine.SpyObj<AuthenticationService>;

    // TODO: Move to utils
    function mockAuthState(user: unknown): void {
        const authState = new BehaviorSubject<unknown>(user);
        authService.getAuthenticationState.and.returnValue(authState.asObservable());
        fixture.detectChanges();
    }

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationService', ['getAuthenticationState']);

        fixture = TestBed.configureTestingModule({
            providers: [{ provide: AuthenticationService, useValue: authSpy }],
            declarations: [TestComponent, UserDirective],
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
});
