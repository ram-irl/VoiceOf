/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var isMenushowned = false;
var isListsviewshowned = false;

function showMenus(){
    ga('send', 'event', 'Menu', 'click', 'Show menu');
    if(isListsviewshowned){isListsviewshowned=true; showListview();}
    
    if(!isMenushowned){
        $('div#menu-slider').addClass('navigate');
        $('#menu-tag').addClass('selected');
        isMenushowned = true;
    }else{
        $('div#menu-slider').removeClass('navigate');
        $('#menu-tag').removeClass('selected');
        isMenushowned = false;
    }   
   
}

function showListview(){
    
    if(isMenushowned){isMenushowned=true; showMenus();}
    
    if(!isListsviewshowned){
        $('div#list-slider').addClass('show-list-navigate');
        $('#list-tag').addClass('selected');
        isListsviewshowned = true;
    }else{
        $('div#list-slider').removeClass('show-list-navigate');
        $('#list-tag').removeClass('selected');
        isListsviewshowned = false;
    } 
    
}

//function showDetailPost(){
//    
//    $('div#list-slider').removeClass('show-list-navigate');
//        isListsviewshowned = false;
//        
//    $('#postDetails').modal();                      // initialized with defaults
//        $('#postDetails').modal({keyboard: false});   // initialized with no keyboard
//        $('#postDetails').modal('show');                // initializes and invokes show immediately
//}

function showSocialSharingMenus(){
    
    $('div#list-slider').removeClass('show-list-navigate');
        isListsviewshowned = false;
        
         $('div#menu-slider').removeClass('navigate');
        isMenushowned = false;
        
    $('#socialmedia').modal();                      // initialized with defaults
        $('#socialmedia').modal({keyboard: false});   // initialized with no keyboard
        $('#socialmedia').modal('show');                // initializes and invokes show immediately
}

