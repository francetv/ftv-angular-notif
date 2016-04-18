describe('Modules::notif::notifUtil::Service', function() {
    var notiPrefix = 'notif';
    beforeEach(module('ftv.components.notif'));

    describe('notifUtil', function() {
        var notifUtil, dummyNotif, dummyNotif2;

        beforeEach(inject(function(_notifUtil_, Notif) {
            dummyNotif = new Notif({
                message: "Ftv n'est pas optimisé pour votre configuration, on y travaille",
                buttonText: 'J\'ai compris',
                id: 'dummyId',
                error: true,
                sendOnValidate: "Some Dummy Tag"
            });
            dummyNotif2 = new Notif({
                message: "Ftv",
                buttonText: 'J\'ai compris !',
                id: 'dummyId2',
                error: true,
                sendOnValidate: "Some Dummy Tag"
            });
            notifUtil = _notifUtil_;
        }));

        describe('create', function() {
            it('should create an notif object based on the options passed', function() {
                var myOptions = {
                    id: 'myId',
                    hideFor: 24,
                    message: 'my first message'
                };
                var myNotif = notifUtil.create(myOptions);

                expect(myNotif.constructor.name).toEqual('Notif');
                expect(myNotif.id).toEqual(myOptions.id);
                expect(myNotif.hideFor).toEqual(myOptions.hideFor);
                expect(myNotif.message).toEqual(myOptions.message);
            });
        });

        describe('add', function() {
            it('should push to notifications any new notifications through the display method', function() {
                spyOn(notifUtil, 'display').and.callThrough();

                notifUtil.add(dummyNotif);

                expect(notifUtil.notifications.length).toBe(1);
                expect(notifUtil.display).toHaveBeenCalledWith(dummyNotif);
            });
            it('should not push already validated notifications', function() {
                spyOn(dummyNotif, 'isValidated').and.returnValue(true);

                notifUtil.add(dummyNotif);

                expect(dummyNotif.isValidated).toHaveBeenCalled();
                expect(notifUtil.notifications.length).toBe(0);
            });
            it('should not push postoned notif', function () {
                spyOn(dummyNotif, 'getTimeValue').and.returnValue(new Date().getTime() - 10);
                dummyNotif.hideFor = 24;

                notifUtil.add(dummyNotif);
                expect(notifUtil.notifications.length).toBe(0);
            });

            it('should not push notif if the id is already in the notifiactions array', function() {
                spyOn(notifUtil, 'findById').and.callThrough();

                expect(notifUtil.notifications.length).toEqual(0);

                notifUtil.add(dummyNotif);
                expect(notifUtil.notifications.length).toEqual(1);

                notifUtil.add(dummyNotif);
                expect(notifUtil.notifications.length).toEqual(1);

                notifUtil.add(dummyNotif2);
                expect(notifUtil.notifications.length).toEqual(2);

                expect(notifUtil.findById.calls.count()).toEqual(3);
            });
            it('when hideFor config then stamp on display', function () {
                spyOn(dummyNotif, 'stamp');
                dummyNotif.hideFor = 24;

                notifUtil.add(dummyNotif);
                notifUtil.add(dummyNotif);

                expect(dummyNotif.stamp.calls.count()).toEqual(1);
            });
        });

        describe('findById', function() {
            it('should return the notif with the id passed', function() {
                notifUtil.add(dummyNotif);
                notifUtil.add(dummyNotif2);

                var myNotif = notifUtil.findById(dummyNotif.id);

                expect(myNotif.id).toEqual(dummyNotif.id);
            });
            it('should return null if the id is not found', function() {
                notifUtil.add(dummyNotif);

                var myNotif = notifUtil.findById('unknown id');

                expect(myNotif).toEqual(null);
            });
        });

        describe('display', function() {
            it('should push a notif to the notifications array', function() {
                expect(notifUtil.notifications.length).toBe(0);

                notifUtil.display(dummyNotif);

                expect(notifUtil.notifications.length).toBe(1);
            });
            it('should trigger the notif update method', function() {
                spyOn(dummyNotif, 'update');

                notifUtil.display(dummyNotif);

                expect(dummyNotif.update).toHaveBeenCalled();
            });
            it('should trigger the notif stamp method if needed', function() {
                spyOn(dummyNotif, 'stamp');
                spyOn(dummyNotif2, 'stamp');
                dummyNotif2.hideFor = 24;

                notifUtil.display(dummyNotif);
                notifUtil.display(dummyNotif2);

                expect(dummyNotif.stamp).not.toHaveBeenCalled();
                expect(dummyNotif2.stamp).toHaveBeenCalled();
            });
            it('should let the app know when a notif is added', inject( function ($rootScope) {
                spyOn($rootScope, '$emit');

                notifUtil.display(dummyNotif);

                expect($rootScope.$emit).toHaveBeenCalledWith('ftv.notificationsChanged', notifUtil.notifications);
            }));
        });

        describe('remove', function() {
            it('should remove the notif from the array without modifying the localStorage', function() {
                notifUtil.add(dummyNotif);
                expect(notifUtil.notifications.length).toBe(1);

                //expect(appData.getLocalItem(notiPrefix + dummyNotif.id)).toEqual(undefined);
                expect(localStorage.getItem(notiPrefix + dummyNotif.id)).toEqual(null);

                notifUtil.remove(0, dummyNotif);

                expect(notifUtil.notifications.length).toBe(0);
                //expect(appData.getLocalItem(notiPrefix + dummyNotif.id)).toEqual(undefined);
                expect(localStorage.getItem(notiPrefix + dummyNotif.id)).toEqual(null);
            });
        });
    });
});