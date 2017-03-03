const app = angular.module('app', ['ngCookies'])

app.factory('getUsers', function ($http) {
  return $http.post('/users')
})
app.factory('getClocks', function ($http) {
  return $http.post('/clocks')
})

app.controller('indCtrl', ['$scope', '$cookies', 'getUsers', 'getClocks', function ($scope, $cookies, getUsers, getClocks) {
  const ind = this
  if ($cookies.get('user')) {
    let cookieSplit = $cookies.get('user').split(':')
    ind.cookieId = cookieSplit[1]
  }
  getUsers.then(d => {
    ind.data = d.data
    ind.userObj = ind.data.find(item => item._id === ind.cookieId)
  })
}])

app.controller('clockCtrl', ['$scope', 'getClocks', function ($scope, getClocks) {
  const clock = this
  getClocks.then(d => {
    clock.list = d.data
    if (clock.list.length) {
      // check for active items
      clock.active = clock.list.find(item => item.active === true)
      if (clock.active) {
        clock.status = {
          text: 'Clock Out',
          active: true,
          style: 'btn-danger'
        }
      } else {
        clock.status = {
          text: 'Clock In',
          active: false,
          style: 'btn-success'
        }
      }
      // add total time
      clock.list.forEach(item => {
        if (item.end && !item.active) {
          let start = new Date(item.start).getTime()
          let end = new Date(item.end).getTime()
          let ms = end - start
          let time = msToTime(ms)
          item.total = time
        }
      })
    }
  })
  // clock.list = []
  clock.in = function () {
    clock.startTime = new Date()
    let item = {
      start: new Date(),
      end: false,
      total: false
    }
    clock.list.push(item)
    clock.active = true
  }
  clock.out = function () {
    let pos = clock.list.length - 1
    clock.list[pos].end = new Date()
    clock.list[pos].total = total(pos)
    clock.active = false
  }
  function msToTime (duration) {
    let milliseconds = parseInt((duration % 1000) / 100)
    let seconds = parseInt((duration / 1000) % 60)
    let minutes = parseInt((duration / (1000 * 60)) % 60)
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24)
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    return hours + ':' + minutes + ':' + seconds + '.' + milliseconds
  }
}])
