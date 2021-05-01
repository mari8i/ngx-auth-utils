import { DynamicStorageProvider, STORAGE_TIMESTAMP_FIELD } from './storage.provider';

describe('Dynamic Storage provider', () => {
    function extractLocalStorageTimestamp(): Date {
        const timestampStr: string | null = localStorage.getItem(STORAGE_TIMESTAMP_FIELD);
        expect(timestampStr).toBeTruthy();

        // Make the compiler happy..
        if (!timestampStr) {
            throw Error();
        }
        return new Date(timestampStr);
    }

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('dynamic storage does not default to any provider if no previous one is found', () => {
        const sut = new DynamicStorageProvider();
        const key = sut.retrieve('foo');

        expect(key).toBeNull();
        expect(sut.getType()).toBeFalsy();
    });

    it('dynamic storage automatically uses last used storage if any', () => {
        const baseTime = new Date();
        jasmine.clock().mockDate(baseTime);

        const prevStorage = new DynamicStorageProvider();
        prevStorage.setType('local');
        prevStorage.store('foo', 'bar');

        const timestamp = extractLocalStorageTimestamp();
        expect(timestamp).toEqual(baseTime);

        const newTime = new Date(baseTime.getTime() + 100);
        jasmine.clock().mockDate(newTime);

        const sut = new DynamicStorageProvider();
        expect(sut.getType()).toEqual('local');

        const newTimestamp = extractLocalStorageTimestamp();
        expect(newTimestamp).toEqual(newTime);
    });

    it('uses last used storage if more than one found', () => {
        const localTime = new Date();
        const sessionTime = new Date(localTime.getTime() + 2000);

        localStorage.setItem(STORAGE_TIMESTAMP_FIELD, localTime.toISOString());
        sessionStorage.setItem(STORAGE_TIMESTAMP_FIELD, sessionTime.toISOString());

        let sut = new DynamicStorageProvider();
        expect(sut.getType()).toEqual('session');

        const newLocal = new Date(sessionTime.getTime() + 2000);
        localStorage.setItem(STORAGE_TIMESTAMP_FIELD, newLocal.toISOString());

        sut = new DynamicStorageProvider();
        expect(sut.getType()).toEqual('local');
    });

    it('checks that storage is initialized when using clear and store', () => {
        const sut = new DynamicStorageProvider();

        expect(function () {
            sut.clear('foo');
        }).toThrow(Error('Storage not initialized'));
        expect(function () {
            sut.store('foo', 'bar');
        }).toThrow(Error('Storage not initialized'));
    });
});
