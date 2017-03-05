const app = angular.module('app', ['ngCookies'])

app.factory('getUsers', function ($http) {
  return $http.post('/users')
})
app.factory('getClocks', function ($http) {
  return $http.get('/clock')
})
app.factory('admClocks', function ($http) {
  return $http.get('/clock/all')
})
app.factory('getProj', function ($http) {
  return $http.get('/clock/projects')
})
app.controller('indCtrl', ['$scope', '$cookies', 'getUsers', function ($scope, $cookies, getUsers) {
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

app.controller('clockCtrl', ['$scope', 'getClocks', 'getProj', function ($scope, getClocks, getProj) {
  const clock = this
  clock.status = {text: 'Clock In', active: false, style: 'btn-success'}
  getClocks.then(d => {
    clock.list = d.data
    if (clock.list.length) {
      // check for active items
      clock.active = clock.list.find(item => item.active === true)
      if (clock.active) {
        clock.status = {text: 'Clock Out', active: true, style: 'btn-warning'}
      } else {
        clock.status = {text: 'Clock In', active: false, style: 'btn-success'}
      }
      // add total time
      clock.list.forEach(item => {
        if (item.end && !item.active) {
          let start = new Date(item.start)
          let end = new Date(item.end)
          let endTime = end.getTime()
          let startTime = start.getTime()
          let ms = endTime - startTime
          let time = msToTime(ms)
          item.total = time
        }
      })
    }
  })
  getProj.then(d => { clock.projects = d.data })
  clock.isMarked = function (item) { if (item.marked) return 'table-danger' }
  clock.proj = {
    create: false,
    btnText: 'New Project'
  }
  clock.addProj = function () {
    if (clock.proj.create) {
      clock.proj.create = false
      clock.proj.btnText = 'New Project'
    } else {
      clock.proj.create = true
      clock.proj.btnText = 'Return to List'
    }
  }
}])

app.controller('admCtrl', ['$scope', 'admClocks', function ($scope, admClocks) {
  const adm = this
  adm.isMarked = function (item) { if (item.marked) return 'table-danger' }
  admClocks.then(d => {
    adm.list = d.data
    adm.list.forEach(item => {
      if (item.end && !item.active) {
        let start = new Date(item.start)
        let end = new Date(item.end)
        let endTime = end.getTime()
        let startTime = start.getTime()
        let ms = endTime - startTime
        let time = msToTime(ms)
        item.total = time
      }
    })
  })
}])

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
