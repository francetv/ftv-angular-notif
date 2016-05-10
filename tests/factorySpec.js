/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 France Télévisions
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

describe('Modules::notif::Notif::factory', function() {
    var dummyNotif;
    beforeEach(module('ftv.components.notif'));

    beforeEach(inject (function (Notif) {
        dummyNotif = new Notif({
            message: "Ftv n'est pas optimisé pour votre configuration, on y travaille",
            buttonText: 'J\'ai compris',
            id: 'dummyId',
            error: true,
            sendOnValidate: "Some Dummy Tag"
        });

        spyOn(localStorage, 'setItem');
        spyOn(localStorage, 'getItem');
        spyOn(localStorage, 'removeItem');
    }));

    describe('getValidatedLimit', function() {
        it('return 1 when notif undefined', function() {
            expect(dummyNotif.getValidatedLimit()).toBe(1);
        });
        it('return 1 when notif has no timesShowed', function() {
            expect(dummyNotif.getValidatedLimit()).toBe(1);
        });
        it('return timesShowed when notif not existing in notifications', function() {
            dummyNotif.timesShowed = 3;
            expect(dummyNotif.getValidatedLimit()).toBe(dummyNotif.timesShowed);
        });
    });

    describe('inc', function() {
        it('inc value', function() {
            spyOn(dummyNotif, 'getValue').and.returnValue(0);
            spyOn(dummyNotif, 'setValue');

            dummyNotif.inc();
            expect(dummyNotif.setValue).toHaveBeenCalledWith(1);
        });
    });

    describe('setValue', function () {
        it('should write the value in localStorage', function() {
            var dummyValue = "myValue";
            dummyNotif.setValue(dummyValue);

            expect(localStorage.setItem).toHaveBeenCalledWith(dummyNotif.prefix + '-' + dummyNotif.id, dummyValue);
        });
    });

    describe('removeValue', function() {
        it('should remove the value in localStorage', function() {
            dummyNotif.removeValue();

            expect(localStorage.removeItem).toHaveBeenCalledWith(dummyNotif.prefix + '-' + dummyNotif.id);
        });
    });

    describe('setTimeValue', function () {
        it('should call setValue with the right params', function () {
            spyOn(dummyNotif, 'setValue');

            dummyNotif.setTimeValue(15984);

            expect(dummyNotif.setValue).toHaveBeenCalledWith(15984, dummyNotif.timePrefix);
        });
    });

    describe('removeTimeValue', function() {
        it('should remove the value in localStorage', function() {
            dummyNotif.removeTimeValue();

            expect(localStorage.removeItem).toHaveBeenCalledWith(dummyNotif.prefix + '-' + dummyNotif.timePrefix + '-' + dummyNotif.id);
        });
    });

    describe('getValue', function() {
        it('should get the value corresponding to the notif', function() {
            var dummyValue = '1';

            localStorage.getItem.and.returnValue(dummyValue);

            expect(dummyNotif.getValue()).toEqual(1);
            expect(localStorage.getItem).toHaveBeenCalledWith(dummyNotif.prefix + '-' + dummyNotif.id);
        });
        it('should return 0 if the value is null', function() {
            expect(dummyNotif.getValue()).toEqual(0);
        });
        it('should get the value corresponding to the notif limit when string', function() {
            var dummyValue = 'true';

            localStorage.getItem.and.returnValue(dummyValue);
            spyOn(dummyNotif, 'setValue');

            expect(dummyNotif.getValue()).toEqual(1);
            expect(localStorage.getItem).toHaveBeenCalledWith(dummyNotif.prefix + '-' + dummyNotif.id);
            expect(dummyNotif.setValue).toHaveBeenCalledWith(1, undefined);
        });
    });

    describe('getTimeValue', function () {
        beforeEach(function () {
            localStorage.getItem.and.returnValue("159");
        });
        it('should call getvalue with the time prefix', function () {
            spyOn(dummyNotif, 'getValue');
            dummyNotif.getTimeValue();

            expect(dummyNotif.getValue).toHaveBeenCalledWith(dummyNotif.timePrefix);
        });

        it('should parse the value', function () {
            var myTime = dummyNotif.getTimeValue('dummy-id');

            expect(myTime).toEqual(159);
        });
    });

    describe('stamp', function () {
        it('should call setTimeValue', function () {
            spyOn(dummyNotif, 'setTimeValue');

            dummyNotif.stamp('dummy-id', 0);

            expect(dummyNotif.setTimeValue).toHaveBeenCalledWith(jasmine.any(Number));
        });
    });

    describe('shouldBeHidden', function() {
        it('should return false if no hideFor', function() {
            expect(dummyNotif.shouldBeHidden()).toEqual(false);
        });
        it('should return false if no value is found in local storage', function () {
            spyOn(dummyNotif, 'getTimeValue').and.returnValue(null);
            dummyNotif.hideFor = 24;

        });
        it('should return true if the delta (in milliseconds) between now and the stored time is smaller than hideFor value (in hours)', function() {
            spyOn(dummyNotif, 'getTimeValue').and.returnValue(new Date().getTime() - 10);
            dummyNotif.hideFor = 24;

            expect(dummyNotif.shouldBeHidden()).toEqual(true);

            dummyNotif.getTimeValue.and.returnValue(new Date().getTime() - 90000000);

            expect(dummyNotif.shouldBeHidden()).toEqual(false);
        });
    });

    describe('getKey', function() {
        it('should return only the Notif prefix if no params followed by the id', function() {
            expect(dummyNotif.getKey()).toEqual(dummyNotif.prefix + '-' + dummyNotif.id);
        });
        it('should return the Notif prefix + the prefix passed separated by - followed by the id', function() {
            expect(dummyNotif.getKey('time')).toEqual(dummyNotif.prefix + '-time-' + dummyNotif.id);
        });
    });

    describe('hasReachedLimit', function() {
        it('should return false if notif value is lower than the passed value', function() {
            spyOn(dummyNotif, 'getValue').and.returnValue(1);

            expect(dummyNotif.hasReachedLimit(2)).toEqual(false);
        });

        it('should return true if notif value is equal or higher than th passed value', function() {
            spyOn(dummyNotif, 'getValue').and.returnValue(3);

            expect(dummyNotif.hasReachedLimit(3)).toEqual(true);
            expect(dummyNotif.hasReachedLimit(2)).toEqual(true);
        });
    });

    describe('isValidated', function() {
        it('should trigger hasReachedLimit with the getValidatedLimit value', function() {
            spyOn(dummyNotif, 'hasReachedLimit');
            spyOn(dummyNotif, 'getValidatedLimit').and.returnValue(5);

            dummyNotif.isValidated();

            expect(dummyNotif.hasReachedLimit).toHaveBeenCalledWith(5);
        });
        it('should return the value of hasReachedLimit', function() {
            spyOn(dummyNotif, 'hasReachedLimit').and.returnValue(true);
            expect(dummyNotif.isValidated()).toEqual(true);

            dummyNotif.hasReachedLimit.and.returnValue(false);
            expect(dummyNotif.isValidated()).toEqual(false);
        });
    });

});