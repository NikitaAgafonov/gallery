const module = angular.module('gallery', ['ngRoute','cfp.hotkeys']),
		url = 'https://api-fotki.yandex.ru/api/top/?format=json',
		countImg = 49,
		countImgPage = 12;

let nowPage = 0,
	watchImgId = 0,
	pages = [];

module.config(function($routeProvider){

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

module.config(function($sceDelegateProvider){

	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		url
	]);

});


module.controller('photos',function($scope,$http,$routeParams,$location,$sce,getData){

	$scope.nowPage = nowPage;
	$scope.watchImgId = watchImgId;


	if (!pages[0]) {

		$http({
			method: 'JSONP',
			url: url
		})

		.then(function(response){

				$scope.data = response.data.entries;
				getData.getPages($scope);
				pages = $scope.pages;

				if($routeParams.num) {
					nowPage = $routeParams.num-1;
					$scope.nowPage = $routeParams.num-1;
				}
			}
		)

		.catch((err) => {

				throw err.status+': '+err.statusText;

			}
		);

	} else {

		$scope.pages = pages;

		if($routeParams.num) {
			nowPage = $routeParams.num-1;
			$scope.nowPage = $routeParams.num-1;
		}
	}
});

module.controller('photo',function($scope,$http,$routeParams,$location,$sce,getData,hotkeys){


	$scope.nowPage = nowPage;
	$scope.watchImgId = watchImgId;
	let photoNum;


	$scope.selectPhoto = function(num){

		if (num) {

			if (watchImgId<countImg) {
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

		callback: function(){
			if (watchImgId>0) {
				watchImgId--;
				$location.path('/photo'+watchImgId);
			}
		}

	});


	hotkeys.add({

		combo: 'right',
		description: 'nextPhoto',

		callback: function(){
			if (watchImgId<countImg) {
				watchImgId++;
				$location.path('/photo'+watchImgId);
			}
		}

	});


	if (!pages[0]) {

		$http({
			method: 'JSONP',
			url: url
		})

		.then(function(response){

				$scope.data = response.data.entries;
				getData.getPages($scope);
				pages = $scope.pages;

				if($routeParams.id) {
					watchImgId = $routeParams.id;
					nowPage = Math.floor(watchImgId/countImgPage);
					$scope.watchImgId = watchImgId;
					$scope.nowPage = nowPage;
					photoNum = watchImgId-nowPage*countImgPage;
					$scope.photo = $scope.pages[nowPage][photoNum];
				}
			}
		)

		.catch((err) => {
				throw err.status+': '+err.statusText;
			}
		);

	} else {

		$scope.pages = pages;

		if($routeParams.id) {
			watchImgId = $routeParams.id;
			nowPage = Math.floor(watchImgId/countImgPage);
			$scope.watchImgId = watchImgId;
			$scope.nowPage = nowPage;
			photoNum = watchImgId-nowPage*countImgPage;
			$scope.photo = $scope.pages[nowPage][photoNum];
		}
	}
});

module.factory('getData',function($http){

	return {
		getPages: function($scope){

			$scope.pages = [];
			let j = 0,
				i = 0;

			for(; i <= (Math.ceil($scope.data.length/countImgPage))-1; i++) {

				$scope.pages[i] = [];

				for (let z=0;z<countImgPage;z++) {

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