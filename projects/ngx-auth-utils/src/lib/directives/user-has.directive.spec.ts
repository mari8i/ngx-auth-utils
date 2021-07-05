import { UserHasDirective } from './user-has.directive';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { UserType } from '../interfaces';
import { NgxAuthService } from '../services/ngx-auth.service';

@Component({
    template: `
        <div id="any" *ngxAuthHas="'roles'; any: ['FOO', 'BAR']">FooBar!</div>
        <div id="all" *ngxAuthHas="'roles'; all: ['FOO', 'BAR']">FooBar!</div>
        <div id="eq" *ngxAuthHas="'name'; eq: 'foo'">FooBar!</div>
        <div id="eqCondTrue" *ngxAuthHas="'name'; eq: 'foo'; cond: 1 == '1'">FooBar!</div>
        <div id="eqCondFalse" *ngxAuthHas="'name'; eq: 'foo'; cond: 1 === '1'">FooBar!</div>
        <div id="eqUserCond" *ngxAuthHas="'name'; eq: 'foo'; userCond: [['attr', 'eq', 'bar']]">FooBar!</div>
        <div id="eqElse" *ngxAuthHas="'name'; eq: 'nooooo'; else: elseTemplate">FooBar!</div>
        <ng-template #elseTemplate><div id="eqElseTemplate">Else FooBar!</div></ng-template>
    `,
})
export class AboutComponent {}

describe('UserHasDirective', () => {
    let fixture: ComponentFixture<AboutComponent>;
    let authService: jasmine.SpyObj<AuthenticationService>;

    function mockAuthState(user: UserType): void {
        const authState = new BehaviorSubject<UserType>(user);
        authService.getAuthenticationState.and.returnValue(authState.asObservable());
        fixture.detectChanges();
    }

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationService', ['getAuthenticationState']);

        fixture = TestBed.configureTestingModule({
            providers: [{ provide: AuthenticationService, useValue: authSpy }, NgxAuthService],
            declarations: [AboutComponent, UserHasDirective],
            schemas: [NO_ERRORS_SCHEMA],
        }).createComponent(AboutComponent);

        authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
        TestBed.inject(NgxAuthService);
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

    it('shows contents if condition is true', () => {
        const user = { user: 'username', name: 'foo' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eqCondTrue');
        const contents = div.textContent;
        expect(contents).toBe('FooBar!');
    });

    it('hides contents if condition is false', () => {
        const user = { user: 'username', name: 'foo' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eqCondFalse');
        expect(div).toBeNull();
    });

    it('shows else template if condition is false', () => {
        const user = { user: 'username', name: 'foo' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eqElse');
        expect(div).toBeNull();

        const divTemplate: HTMLElement = fixture.nativeElement.querySelector('#eqElseTemplate');
        const contents = divTemplate.textContent;
        expect(contents).toBe('Else FooBar!');
    });

    it('shows contents if user condition is true', () => {
        const user = { user: 'username', name: 'foo', attr: 'bar' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eqUserCond');
        const contents = div.textContent;
        expect(contents).toBe('FooBar!');
    });

    it('hides contents if user condition is false', () => {
        const user = { user: 'username', name: 'foo', attr: 'noooo' };
        mockAuthState(user);

        const div: HTMLElement = fixture.nativeElement.querySelector('#eqUserCond');
        expect(div).toBeNull();
    });
});
