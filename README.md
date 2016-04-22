# Ftv::Components::Notif

Create notification at the bottom right of webpage.

## Get sources

```
git clone git@gitlab.ftven.net:team-infini/ftv-angular-notif.git
```

## How to use

Include javascript and css

```
<script src="dist/js/ftv.components.notif.js"></script>
<link rel="stylesheet" href="dist/css/ftv.components.notif.css">
```

Include component in your app

```
angular.module('app', ['ftv.components.notif'])
```

Create a notification 

```
var firstNotif = notifUtil.create(options);
```

And add it

```
notifUtil.add(firstNotif);
```

### Options

* (string)    message            : message of the notification
* (string)    buttonText         : text of the button (optional)
* (string)    id                 : id of the notif (optional)
* (boolean)   error              : if notif error type (optional)
* (int)       timesShowed        : times to be showed (optional)
* (string)    picto              : picto to be inserted (optional)
* (string)    icon               : icon to be inserted (optional)
* (int)       duration           : duration to be showed (optional)
* (int)       delay              : delay before showing (optional)
* (string)    link               : link for the button (optional)
* (string)    action             : action to emit to the application (optional)
* (string)    sendOnValidate     : analytics used (optional)
* (string)    sendOnRemove       : analytics used (optional)
* (string)    sendOnPublish      : analytics used (optional)
* (int)       hideFor            : duration in hours (optional)
* (boolean)   removable          : user can close the notif (optional)

### Events

Event throw in $rootScope.

* ftv.notif.click : when clicked on notification
* ftv.notif.publish : when notification is displayed
* ftv.notif.changed : when array of notification has changed. eg: when add or push new notification.

## Required dependencies

- [npm](https://nodejs.org/)
- [gem](https://rubygems.org/)

## Build process

```
sudo apt-get install ruby ruby-dev gem
npm install -g gulp

npm install
sudo gem install compass

gulp build
```

## Development build for front web only

```
gulp build-dev
```

## Run test

```
gulp test
```

## Demo

```
npm install -g http-server
http-server
gulp build
```

Open [demo](http://127.0.0.1:8080/demo.html)