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

angular.module('app', [
    'ftv.components.notif'
])

    .controller('AppCtrl', ['notifUtil', '$rootScope', function (notifUtil, $rootScope) {
        function firstNotif () {
            var options = {
                message: "Bienvenue ! Cette notif disparaîtra au bout de 20 seconde !",
                buttonText: 'J\'ai compris',
                duration: 20000,
                delay: 2000,
                timesShowed: 5000,
                sendOnValidate: 'Notif::firstNotif',
                sendOnPublish: 'Notif::firstNotif'
            };

            var firstNotif = notifUtil.create(options);

            notifUtil.add(firstNotif);
        }

        function secondNotif () {
            var options = {
                message: "Attention ! seconde notif s'en ira d'elle-même dans 30 seconde...",
                duration: 10000,
                error: true,
                timesShowed: 5000,
                id: 'ho-my-error',
                sendOnValidate: 'Notif::secondNotif',
                sendOnPublish: 'Notif::secondNotif'
            }

            notifUtil.add(notifUtil.create(options));
        }

        function thirdNotif () {
            var options = {
                message: "Ceci est la troisième notif se montrant dès qu'une place ce libère",
                duration: 3000,
                timesShowed: 5000,
                id: 'ho-my-third',
                sendOnValidate: 'Notif::thirdNotif',
                sendOnPublish: 'Notif::thirdNotif'
            }

            notifUtil.add(notifUtil.create(options));
        }

        $rootScope.$on('ftv.notificationsChanged', function($e, notif) {
            console.log('ftv.notificationsChanged', notif);
        });

        firstNotif();
        secondNotif();
        thirdNotif();
    }])

;