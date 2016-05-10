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

describe('Modules::notif::', function() {
    describe('ftvNotifWrapper::Directive', function() {
        var $scope, directiveScope, element, controller, dummyNotifs;

        dummyNotifs = [{
                    message: "Notifiaction général",
                    buttonText: 'OK',
                    id: 'generale',
                    error: false
                },
                {
                    message: "Ceci est une erreur de test, on y travaille",
                    buttonText: 'J\'ai compris',
                    id: 'device',
                    error: true
                }];

        beforeEach(module('ftv.components.notif'));

        beforeEach(inject(function (notifUtil) {
            notifUtil.notifications = dummyNotifs;
        }));

        beforeEach(inject(function ($controller, $rootScope) {
            $scope = $rootScope;
            controller = $controller('FtvNotifWrapperController', {
                $scope: $scope
            });
        }));

        describe('notifications', function() {
            it('should be an array of objects', function() {
                expect($scope.notifications).toEqual(jasmine.any(Array));
                expect($scope.notifications[0]).toEqual(jasmine.any(Object));
            });
        });
    });

    describe('ftvNotifSingle::Directive', function() {
        var $scope, directiveScope, element;

        var windowObj = {
            location: '/dummy/url',
            bowser: {
                mobile: false,
                msie: false
            },
            open: function (link) {
                return link;
            },
            ftvDeviceLoader: window.ftvDeviceLoader
        };

        beforeEach(module('ftv.components.notif', function($provide){
            $provide.value('$window', windowObj);
        }));

        var dummyNotif = {
            message: "Notifiaction général",
            buttonText: 'OK',
            id: 'generale',
            error: false
        };
        var index = 0;

        beforeEach(inject(function ($compile, $rootScope, Notif) {
            $scope = $rootScope;
            $scope.notif = new Notif(dummyNotif);
            $scope.index = index;

            element = $compile('<ftv-notif index="index" notif="notif"></ftv-notif>')($scope);

            $scope.$digest();

            directiveScope = element.isolateScope();
        }));

        describe('init', function() {
            it('set isInit and displayed value to true', function() {
                spyOn(directiveScope.notif, 'sendPublish');
                expect(directiveScope.isInit).toEqual(false);
                expect(directiveScope.displayed).toEqual(false);

                directiveScope.init();

                expect(directiveScope.isInit).toEqual(true);
                expect(directiveScope.displayed).toEqual(true);
                expect(directiveScope.notif.sendPublish).toHaveBeenCalledWith('sendOnPublish');
            });
            it('call close after timeout when notif.duration is set', inject(function($timeout) {
                spyOn(directiveScope, 'close');
                directiveScope.notif.duration = 100;

                directiveScope.init();

                expect(directiveScope.close).not.toHaveBeenCalled();

                $timeout.flush();

                expect(directiveScope.close).toHaveBeenCalled();
            }));
            it('dont call close after timeout when notif.duration is not set', inject(function($timeout) {
                spyOn(directiveScope, 'close');
                directiveScope.notif.duration = null;

                directiveScope.init();

                expect(directiveScope.close).not.toHaveBeenCalled();

                $timeout.flush();

                expect(directiveScope.close).not.toHaveBeenCalled();
            }));
        });

        describe('close', function() {
            it('set displayed to false and call notifUtil.remove after timeout', inject(function($timeout, notifUtil) {
                spyOn(notifUtil, 'remove');
                directiveScope.displayed = true;

                directiveScope.close();

                expect(directiveScope.displayed).toEqual(false);
                expect(notifUtil.remove).not.toHaveBeenCalled();

                $timeout.flush();

                expect(notifUtil.remove).toHaveBeenCalledWith(0, $scope.notif);
            }));
        });

        describe('validate', function() {
            it('set displayed to false', function() {
                directiveScope.displayed = true;

                directiveScope.validate();

                expect(directiveScope.displayed).toEqual(false);
            });
            it('call notifUtil.validate after timeout when notif has no link', inject(function($timeout, notifUtil) {
                spyOn(directiveScope.notif, 'validate');
                spyOn(notifUtil, '_remove');
                directiveScope.displayed = true;

                directiveScope.validate();

                expect(directiveScope.displayed).toEqual(false);
                expect(directiveScope.notif.validate).toHaveBeenCalled();
                expect(notifUtil._remove).not.toHaveBeenCalled();

                $timeout.flush();

                expect(notifUtil._remove).toHaveBeenCalled();
            }));
            it('call notifUtil.validate directly when notif has link', inject(function($timeout, notifUtil, $window) {
                spyOn(directiveScope.notif, 'validate');
                spyOn(notifUtil, '_remove');
                spyOn($window, 'open');
                directiveScope.displayed = true;
                directiveScope.notif.link = '/dummy/link';

                $timeout.flush();

                directiveScope.validate();

                expect(directiveScope.displayed).toEqual(false);
                expect(directiveScope.notif.validate).toHaveBeenCalled();
                expect(notifUtil._remove).toHaveBeenCalled();
                expect($window.open).toHaveBeenCalledWith('/dummy/link', 'ftv-notif');
            }));
        });

        describe('clickButton', function () {
            it('should trigger validate', function () {
                var $event = {
                    stopPropagation: function(){}
                };
                spyOn(directiveScope, 'validate');
                spyOn($event, 'stopPropagation');

                directiveScope.clickButton($event);

                expect(directiveScope.validate).toHaveBeenCalled();
                expect($event.stopPropagation).toHaveBeenCalled();
            });
            it('should call action if notif has action', inject(function () {
                var $event = {
                    stopPropagation: function(){}
                };
                directiveScope.notif.action = function(){};
                spyOn(directiveScope.notif, 'action');
                spyOn(directiveScope, 'validate');
                spyOn($event, 'stopPropagation');

                directiveScope.clickButton($event);

                expect(directiveScope.notif.action).toHaveBeenCalled();
            }));
        });

        describe('clickCross', function () {
            it('should trigger close', function () {
                spyOn(directiveScope, 'close');

                directiveScope.clickCross();

                expect(directiveScope.close).toHaveBeenCalled();
            });
        });

        describe('hasLongButton', function() {
            it('should return false if notif has no buttonText', function () {
                directiveScope.notif.buttonText = null;

                expect(directiveScope.hasLongButton()).toEqual(false);
            });

            it('should return false if notif buttonText < 13', function () {
                directiveScope.notif.buttonText = 'short';

                expect(directiveScope.hasLongButton()).toEqual(false);
            });

            it('should return true if notif buttonText >13', function () {
                directiveScope.notif.buttonText = 'A very long button';

                expect(directiveScope.hasLongButton()).toEqual(true);
            });
        });
    });
});