import { LocalStorageProvider, SessionStorageProvider } from './storage.provider';

describe('Storage providers', () => {
    it('stores values in local storage', () => {
        spyOn(localStorage, 'setItem');
        const sut = new LocalStorageProvider();
        sut.store('test', 'foo');
        expect(localStorage.setItem).toHaveBeenCalledOnceWith('test', 'foo');
    });

    it('deleted key if null value is passed from local storage', () => {
        spyOn(localStorage, 'removeItem');
        const sut = new LocalStorageProvider();
        sut.store('test', null);
        expect(localStorage.removeItem).toHaveBeenCalledOnceWith('test');
    });

    it('retrieves values from local storage', () => {
        spyOn(localStorage, 'getItem').and.returnValue('bar');
        const sut = new LocalStorageProvider();
        const value = sut.retrieve('foo');
        expect(value).toEqual('bar');
        expect(localStorage.getItem).toHaveBeenCalledOnceWith('foo');
    });

    it('clears the value from local storage', () => {
        spyOn(localStorage, 'removeItem');
        const sut = new LocalStorageProvider();
        sut.clear('foo');
        expect(localStorage.removeItem).toHaveBeenCalledOnceWith('foo');
    });

    it('stores values in session storage', () => {
        spyOn(sessionStorage, 'setItem');
        const sut = new SessionStorageProvider();
        sut.store('test', 'foo');
        expect(sessionStorage.setItem).toHaveBeenCalledOnceWith('test', 'foo');
    });

    it('deleted key if null value is passed from session storage', () => {
        spyOn(sessionStorage, 'removeItem');
        const sut = new SessionStorageProvider();
        sut.store('test', null);
        expect(sessionStorage.removeItem).toHaveBeenCalledOnceWith('test');
    });

    it('retrieves values from session storage', () => {
        spyOn(sessionStorage, 'getItem').and.returnValue('bar');
        const sut = new SessionStorageProvider();
        const value = sut.retrieve('foo');
        expect(value).toEqual('bar');
        expect(sessionStorage.getItem).toHaveBeenCalledOnceWith('foo');
    });

    it('clears the value from session storage', () => {
        spyOn(sessionStorage, 'removeItem');
        const sut = new SessionStorageProvider();
        sut.clear('foo');
        expect(sessionStorage.removeItem).toHaveBeenCalledOnceWith('foo');
    });
});
