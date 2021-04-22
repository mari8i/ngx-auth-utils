import { UserHasDirective } from './user-has.directive';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../services/authentication.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    template: `
        <div id="any" *ngxAuthHas="'roles'; any: ['FOO', 'BAR']">FooBar!</div>
        <div id="all" *ngxAuthHas="'roles'; all: ['FOO', 'BAR']">FooBar!</div>
        <div id="eq" *ngxAuthHas="'name'; eq: 'foo'">FooBar!</div>
    `,
})
export class AboutComponent {}

describe('UserHasDirective', () => {
    let fixture: ComponentFixture<AboutComponent>;
    let authService: jasmine.SpyObj<AuthenticationService>;

    function mockAuthState(user: unknown): void {
        const authState = new BehaviorSubject<unknown>(user);
        authService.getAuthenticationState.and.returnValue(authState.asObservable());
        fixture.detectChanges();
    }

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationService', ['getAuthenticationState']);

        fixture = TestBed.configureTestingModule({
            providers: [{ provide: AuthenticationService, useValue: authSpy }],
            declarations: [AboutComponent, UserHasDirective],
            schemas: [NO_ERRORS_SCHEMA],
        }).createComponent(AboutComponent);

        authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    });

    it('Hides contents when user is not authenticated', () => {
        mockAuthState(null);

        const div: HTMLElement = fixture.nativeElement.querySelector('#any');
        expect(div).toBeNull();
    });

    it('shows contents if user matches any values', () => {
        const user = { user: 'username', roles: ['FOO', 'LAME', 'NAA'] };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#any');
        const contents = div.textContent;
        expect(contents).toBe('FooBar!');
    });

    it('hides contents if user does not match any values', () => {
        const user = { user: 'username', roles: ['LAMBDA', 'LAME', 'NAA'] };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#any');
        expect(div).toBeNull();
    });

    it('shows contents if user matches all values', () => {
        const user = { user: 'username', roles: ['FOO', 'BAR', 'NAA'] };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#all');
        const contents = div.textContent;
        expect(contents).toBe('FooBar!');
    });

    it('hides contents if user does not match all values', () => {
        const user = { user: 'username', roles: ['FOO', 'LAME', 'NAA'] };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#all');
        expect(div).toBeNull();
    });

    it('shows contents if user matches value', () => {
        const user = { user: 'username', name: 'foo' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eq');
        const contents = div.textContent;
        expect(contents).toBe('FooBar!');
    });

    it('hides contents if user does not match value', () => {
        const user = { user: 'username', name: 'bar' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eq');
        expect(div).toBeNull();
    });
});
