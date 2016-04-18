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
                message: "Attention ! seconde notif s'ennira d'elle-même dans 30 seconde...",
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