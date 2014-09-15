/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        var $ul_list = $("#similar_artist");
    var mglfm = {};

    $("#sbm_search").on("click",function(e,data){

        if($("#txt_search").val() !== ""){
            $.mobile.changePage("#search_results"); 
        }else {
            $.mobile.changePage("#no_search",{role:"dialog"});
        }
        
    });
    $(document).on("pagecontainerbeforechange",function(e,data){
        if(typeof(data.toPage) === "string"){
            var u = $.mobile.path.parseUrl(data.toPage);
            var show_artist = /^#detail/;

            if(u.hash.search(show_artist) !== -1){
                cleanFields();
                showDescription(u,data.options);
                e.preventDefault();

            }else if(u.hash.search(/^#search_results/) !== -1){

                var search_term = $("#txt_search").val();
                findSimilar(search_term);

            }
        }
    });

    function findSimilar(search_term){
        
        $ul_list.html("");
        mglfm.artists = "";
        $.mobile.loading("show",{text:"Cargando artistas", textVisible:true,theme:"a"});
        $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + encodeURI(search_term) +"&api_key=9f8bcc4f671709f87a04b3b44af7fc12&format=json",function(result){
        
        //Validación de error por parte de LFM API
        var error = (typeof result.error === "string") ? true : false;
        mglfm.artists = result.similarartists.artist;
        
        if(typeof mglfm.artists !== "string" && error == false){
            for (var artist in mglfm.artists){
            
                var image = mglfm.artists[artist].image[2]["#text"];
                
                var name = mglfm.artists[artist].name;
                var content = '<li><a href="#detail?artist=' + artist + '"><img src="' + image +'" alt="' + name +'" />' + name + '</a></li>';

                $ul_list.append(content);
            }
            
            var options = {};
            

        }else {
            $ul_list.append('<li>No se encontraron resultados</li>');
        }
        
        $ul_list.listview( "refresh" );
        $.mobile.loading("hide");
        $.mobile.changePage($("#search_results"),options);

    });
    }

    //Funcion para limpiar los campos
    function cleanFields(){
        $("#lbl_name").html("");
        $("#lbl_bio").html("");
        $("#lbl_year").html("--");
        $("#lbl_formed").html("--");
        $("#artist_photo").attr("src","")
    }

    //showDescription(url,options)
    function showDescription(url,options){
        var artist_id = url.hash.replace(/.*artist=/,"");
        var pageSelector = url.hash.replace(/\?.*$/,"");

        if(artist_id){
            
            var $page = $(pageSelector);

            if(mglfm.artists[artist_id].mbid !== ""){
                $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid="+ mglfm.artists[artist_id].mbid + "&api_key=9f8bcc4f671709f87a04b3b44af7fc12&format=json",function(result){
                
                    var artist = result.artist;


                    $("#lbl_name").html(artist.name);
                    $("#lbl_bio").html(artist.bio.content);
                    $("#lbl_year").html(artist.bio.yearformed);
                    $("#lbl_formed").html(artist.bio.placeformed);
                    $("#artist_photo").attr("src",artist.image[3]["#text"])

                });
                
    
            }else {
                    $("#lbl_name").html("No disponible");
                    $("#lbl_bio").html("No disponible");
                    $("#lbl_year").html("No disponible");
                    $("#lbl_formed").html("No disponible");
                    $("#artist_photo").attr("src","not_found.jpg");
            }

            options.dataUrl = url.href;             
            $.mobile.changePage($page,options);         
        }

    }

    },//END DEVIDE READY
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
