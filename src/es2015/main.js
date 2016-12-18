const module = angular.module('gallery', ['ngRoute','cfp.hotkeys']),
		url = "https://api-fotki.yandex.ru/api/top/?format=json";


let nowPage = 0,
	watchImgId = 0;

module.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'photos.html',
			controller: 'photos'
		})
		.when('/photo:id', {
			templateUrl: 'photo.html',
			controller: 'photo'
		})
		.when('/page:num', {
			templateUrl: 'photos.html',
			controller: 'photos'
		})
		.otherwise({
			template: '<center><h1>404 NOT FOUND</h1></center>'
		})
});

module.config(function($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		url
	]);
});

module.controller('photos', function($scope,$http,$routeParams,$location,$sce,getData){
	$scope.nowPage = nowPage;
	$scope.watchImgId = watchImgId;
	$http({
		method: 'JSONP',
		url: url
	}).then(function (response) {
		$scope.data = response.data.entries;
		getData.getPages($scope);
		console.log('$scope', $scope.pages);
		if($routeParams.num) {
			nowPage = $routeParams.num-1;
			$scope.nowPage = $routeParams.num-1;
		}
	}, function (err) {
		console.log(err);
	});
});

module.controller('photo', function($scope,$http,$routeParams,$location,$sce,getData,hotkeys){
	$scope.nowPage = nowPage;
	$scope.watchImgId = watchImgId;
	$scope.selectPhoto = function (num) {
		if (num) {
			if (watchImgId<=48) {
				watchImgId++;
				$location.path('/photo'+watchImgId);
			}
		} else {
			if (watchImgId>0) {
				watchImgId--;
				$location.path('/photo'+watchImgId);
			}
		}
	};
	hotkeys.add({
		combo: 'left',
		description: 'prevPhoto',
		callback: function() {
			if (watchImgId>0) {
				watchImgId--;
				$location.path('/photo'+watchImgId);
			}
		}
	});
	hotkeys.add({
		combo: 'right',
		description: 'nextPhoto',
		callback: function() {
			if (watchImgId<=48) {
				watchImgId++;
				$location.path('/photo'+watchImgId);
			}
		}
	});
	$http({
		method: 'JSONP',
		url: url
	}).then(function (response) {
		$scope.data = response.data.entries;
		getData.getPages($scope);
		if($routeParams.id) {
			watchImgId = $routeParams.id;
			nowPage = Math.floor(watchImgId/12);
			$scope.watchImgId = watchImgId;
			$scope.nowPage = nowPage;
			let photoNum = watchImgId-nowPage*12;
			$scope.photo = $scope.pages[nowPage][photoNum];
		}
	}, function (err) {
		console.log(err);
	});
});

module.factory('getData', function($http){
	return {
		getPages: function ($scope) {
			$scope.pages = [];
			let j = 0;
			for(let i=0; i <= (Math.ceil($scope.data.length/12))-1; i++) {
				$scope.pages[i] = [];
				for (let z=0;z<12;z++) {
					if ($scope.data[j]) {
						$scope.pages[i].push($scope.data[j]);
					} else {
						break;
					}
					j++;
				}
			}
		}
	};
});