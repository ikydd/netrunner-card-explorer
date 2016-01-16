var app = angular.module('app', []);
app.controller('CardsCtrl', function($scope, CardsSvc){

  $scope.cards = CardsSvc.cards;
  
  $scope.sort = CardsSvc.sort;
  
  $scope.sets = CardsSvc.sets;
});
app.controller('ControlsCtrl', function($scope, CardsSvc){
  
  $scope.sortOptions = [
    {
      title: 'Alphabetically', 
      value: 'title'
    },
    {
      title: 'Type', 
      value: 'type'
    },
    {
      title: 'Faction', 
      value: 'faction'
    }
  ]
  
  $scope.sortOption = 'faction';
  
  $scope.changeSort = function(value){
    CardsSvc.changeSort(value);
  }
  
  $scope.changeSide = function(side) {
    CardsSvc.setSide(side);
  }
  
  $scope.sets = CardsSvc.sets;
  
  $scope.selectedSets = {};
  
  for (var i = 0; i < CardsSvc.sets.all.length; i++) {
    $scope.selectedSets[$scope.sets.all[i].value] = true;
  }
  
  $scope.updateSets = function(updates) {
    CardsSvc.setSets(updates);
  }
  
  $scope.updateSets($scope.selectedSets);
  
  $scope.showSets = false;
  
  $scope.toggleSets = function() {
    $scope.showSets = !$scope.showSets;
  }
});
app.filter('sets', function(){
  return function (input, selected) {
    var l = input.length;
    var out = [];
    for (var i = 0; i < l; i++) {
      var card = input[i];
      if (selected.indexOf(card.set_code) != -1) {
        out.push(card);
      }
    }
    return out;
  }
});

app.filter('side', function(){
  return function (input, side) {
    input = input || [];
    var out = [];
    for (var i = 0; i < input.length; i++) {
      if (input[i].side_code == side){
        out.push(input[i]);
      }
    }
    
    return out;
  }
});

app.service('CardsSvc', function(sideFilter){
  
  var initCards = function(input) {
    var cards = {
      all: [],
      corp: {
        all: [],
        filtered: []
      },
      runner: {
        all: [],
        filtered: []
      },
      display: []
    }
    
    for (var i = 0; i < input.length; i++) {
      var card = input[i];
      if (card.set_code != 'draft') {
        cards.all.push(card);
        cards[card.side_code].all.push(card);
        cards[card.side_code].filtered.push(card);
      }
    }
    
    return cards;
  }
  
  var initSets = function(input) {
    var setCodes = ['draft'];
    var sets = {
      all: [],
      selected: []
    };
    
    for (var i = 0; i < input.length; i++) {
      var card = input[i];
      if (setCodes.indexOf(card.set_code) == -1) {
        setCodes.push(card.set_code);
        sets.all.push({value: card.set_code, label: card.setname});
        sets.selected.push(card.set_code);
      }
    }
    
    return sets;
  }
  
  this.cards = initCards(window.cards);
  this.sets = initSets(window.cards);
  
  var typeOrder = ['identity', 'program', 'hardware', 'resource', 
  'event', 'agenda', 'ice', 'asset', 'upgrade', 'operation'];
  
  var typeSort = function(card) {
    return typeOrder.indexOf(card.type_code);
  }
  
  this.sort = {
    methods : {
      title: ['title'],
      type: [typeSort, 'subtype_code', 'title'],
      faction: ['faction', typeSort, 'title']
    } 
  }

  this.sort.current = this.sort.methods.faction;
  
  this.changeSort = function(value){
    this.sort.current = this.sort.methods[value];
  }
  
  this.setSide = function(side) {
    this.cards.display = this.cards[side].filtered;
  }
  
  // set the corp to show first
  this.setSide('corp');
  
  this.setSets = function(updates) {
    this.sets.selected = [];
    for(set in updates) {
      if (updates[set]) {
        this.sets.selected.push(set);
      }
    }
  }
});