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
    ind.data = d.data
    ind.userObj = ind.data.find(item => item._id === ind.cookieId)
  })
}])
