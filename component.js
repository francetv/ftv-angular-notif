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

angular.module('ftv.components.notif', [
    'ftv.components.notif.templates'
])

    .factory('Notif', ['$rootScope', function ($rootScope) {

        /**
         * @param {Object} options
         *    - string    message            message of the notification
         *    - string    buttonText         text of the button (optional)
         *    - string    id                 id of the notif (optional)
         *    - boolean   error              if notif error type (optional)
         *    - int       timesShowed        times to be showed (optional)
         *    - string    picto              picto to be inserted (optional)
         *    - string    icon               icon to be inserted (optional)
         *    - int       duration           duration to be showed (optional)
         *    - int       delay              delay before showing (optional)
         *    - string    link               link for the button (optional)
         *    - string    action             action to emit to the application (optional)
         *    - string    sendOnValidate     analytics used (optional)
         *    - string    sendOnRemove       analytics used (optional)
         *    - string    sendOnPublish      analytics used (optional)
         *    - int       hideFor            duration in hours (optional)
         *    - boolean   removable          user can close the notification (optional)
         */
        function Notif (options) {
            for (var option in options) {
                this[option] = options[option];
            }

            this.prefix = 'notif';
            this.timePrefix = 'time';
        }

        Notif.prototype.getKey = function (prefix) {
            var key = this.prefix;
            if (prefix) {
                key += '-' + prefix;
            }
            key += '-' + this.id;

            return key;
        };

        Notif.prototype.setValue = function (value, prefix) {
            if (!this.id) {
                return false;
            }

            return localStorage.setItem(this.getKey(prefix), value);
        };

        Notif.prototype.getValue = function (prefix) {
            if (!this.id) {
                return false;
            }

            var value = localStorage.getItem(this.getKey(prefix));

            if (!value) {
                value = 0;
            } else if (isNaN(value)) {
                // !!! important to keep this (allow to revert last values as "true" in users' localstorage)
                // hack done on 18/02/2016
                value = this.getValidatedLimit();
                this.setValue(value, prefix);
            }

            return parseInt(value);
        };

        Notif.prototype.setTimeValue = function (time) {
            return this.setValue(time, this.timePrefix);
        };

        Notif.prototype.getTimeValue = function () {
            return this.getValue(this.timePrefix);
        };

        Notif.prototype.removeValue = function(prefix) {
            return localStorage.removeItem(this.getKey(prefix));
        };

        Notif.prototype.removeTimeValue = function () {
            return this.removeValue(this.timePrefix);
        };

        Notif.prototype.stamp = function () {
            return this.setTimeValue(new Date().getTime());
        };

        Notif.prototype.inc = function() {
            var newInc = this.getValue() + 1;
            if (newInc > this.timesShowed) {
                newInc = this.timesShowed + 1;
            }
            this.setValue(newInc);
        };

        Notif.prototype.update = function () {
            if (this.timesShowed) {
                this.inc();
            }

            if (this.hideFor) {
                this.stamp();
            }
        };

        Notif.prototype.validate = function () {
            this.setValue(this.getValidatedLimit());
            this.sendClick('sendOnValidate');
            this.sendClick('sendOnPublish', true);
        };

        Notif.prototype.sendClick = function (message, isPublish) {
            if (!this[message]) {
                return;
            }

            $rootScope.$emit('ftv.notif.click', this.id, this[message]);
        };

        Notif.prototype.sendPublish = function (message) {
            if (!this[message]) {
                return;
            }

            $rootScope.$emit('ftv.notif.publish', this.id, this[message]);
        };

        Notif.prototype.getValidatedLimit = function() {
            var validateValue = 1;
            if (this.timesShowed) {
                validateValue = this.timesShowed;
            }

            return validateValue;
        };

        Notif.prototype.hasReachedLimit = function (validatedLimit) {
            return this.getValue() >= validatedLimit;
        };

        Notif.prototype.isValidated = function () {
            return this.hasReachedLimit(this.getValidatedLimit());
        };

        Notif.prototype.shouldBeHidden = function () {
            if (!this.hideFor) {
                return false;
            }

            return new Date().getTime() - this.getTimeValue() < 1000 * 60 * 60 * this.hideFor;
        };

        return Notif;
    }])

    .service('notifUtil', ['$rootScope', 'Notif', function ($rootScope, Notif) {
        this.notifications = [];

        this.add = function (notif) {
            if (notif.id && notif.isValidated()) {
                notif.update();
                return;
            }

            if (notif.shouldBeHidden()) {
                return;
            }

            if (this.findById(notif.id)) {
                return;
            }

            this.display(notif);
        };

        this.create = function (options) {
            return new Notif(options);
        };

        this.display = function (notif) {
            this.notifications.push(notif);

            notif.update();

            $rootScope.$emit('ftv.notif.changed', this.notifications);
        };

        this.findById = function (id) {
            var notif = null;

            angular.forEach(this.notifications, function (n) {
                if (n.id === id) {
                    notif = n;
                }
            });

            return notif;
        };

        this.remove = function(index, notif) {
            notif.sendClick("sendOnRemove");

            this._remove(index);
        };

        this._remove = function (index) {
            this.notifications.splice(index, 1);

            $rootScope.$emit('ftv.notif.changed', this.notifications);
        };
    }])

    .controller('FtvNotifWrapperController', ['$scope', 'notifUtil', '$rootScope', function ($scope, notifUtil, $rootScope) {
        $rootScope.$on('notificationsChanged', function(event, notifications){
            if ($scope.$$phase) {
                return;
            }

            $scope.$apply(function(){
                $scope.notifications = notifications;
            });
        });

        $scope.notifications = notifUtil.notifications;
    }])

    .directive('ftvNotifWrapper', function() {
        return {
            restrict: 'E',
            templateUrl: 'ftv.components.notif.wrapper.html',
            controller: 'FtvNotifWrapperController'
        };
    })

    .directive('ftvNotif', ['$timeout', 'notifUtil', '$window', function ($timeout, notifUtil, $window) {
        return {
            restrict: 'E',
            replace: 'true',
            scope: {
                index: '=',
                notif: '='
            },
            link: function (scope) {
                scope.displayed = false;
                scope.isInit = false;

                scope.validate = function () {
                    scope.displayed = false;
                    scope.notif.validate();

                    if (scope.notif.link) {
                        notifUtil._remove(scope.notif);
                        return $window.open(scope.notif.link, 'ftv-notif');
                    }

                    $timeout(function () {
                        notifUtil._remove(scope.notif);
                    }, 500);
                };

                scope.close = function () {
                    scope.displayed = false;
                    $timeout(function () {
                        notifUtil.remove(scope.index, scope.notif);
                    }, 500);
                };

                scope.init = function () {
                    scope.isInit = true;
                    scope.displayed = true;

                    scope.notif.sendPublish('sendOnPublish');

                    // duration
                    if (scope.notif.duration) {
                        $timeout(function () {
                            scope.close();
                        }, scope.notif.duration);
                    }
                };

                scope.clickCross = function () {
                    scope.close();
                };

                scope.hasLongButton = function () {
                    if (!scope.notif.buttonText) {
                        return false;
                    }

                    if (scope.notif.buttonText.length < 13) {
                        return false;
                    }

                    return true;
                };

                scope.clickButton = function ($event) {
                    $event.stopPropagation();
                    scope.validate();

                    if (scope.notif.action) {
                        scope.notif.action();
                    }
                };

                scope.longButton = scope.hasLongButton();

                $timeout(function () {
                    scope.init();
                }, scope.notif.delay || 1500);
            },
            templateUrl: 'ftv.components.notif.single.html'
        };
    }])

;
