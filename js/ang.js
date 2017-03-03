const app = angular.module('app', ['ngCookies'])

app.factory('getUsers', function ($http) {
  return $http.post('/users')
})
app.controller('indCtrl', ['$scope', '$cookies', 'getUsers', function ($scope, $cookies, getUsers) {
  const ind = this
  if ($cookies.get('user')) {
    let cookieSplit = $cookies.get('user').split(':')
    ind.cookieId = cookieSplit[1]
  }
  getUsers.then(d => {
    let data = d.data
    ind.userObj = data.find(item => item._id === ind.cookieId)
  })
}])

app.controller('loginCtrl', ['$scope', 'getUsers', function ($scope, getUsers) {
  const log = this
  getUsers.then(d => {
    log.data = d.data
  })
}])
