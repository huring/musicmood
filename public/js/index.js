(function() {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');


    var recentlyPlayedSource = document.getElementById('recently-played').innerHTML,
        recentlyPlayedTemplate = Handlebars.compile(recentlyPlayedSource),
        recentlyPlayedPlaceholder = document.getElementById('recent');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    var getTrackList = function(response) {

        var songlist = {
            tracks: [],
            mood: 0
        };
        var mood = 0;
        // var trackID = response.items[9].track.id;

        console.info("Loading track list...");
        console.info(response.items.length);

        $(response.items).each(function(i, item) {
            var track = {};

            track.id = item.track.id;
            track.artist = item.track.artists[0].name;
            track.song = item.track.name.substring(0, 30);
            track.album = item.track.album.name.substring(0, 20);
            track.coverart = item.track.album.images[1].url;
            track.link = item.track.external_urls.spotify

            $.ajax({
                url: 'https://api.spotify.com/v1/audio-features/?ids=' + track.id,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {                    
                    var valence = round(response.audio_features[0].valence, 5)
                    track.valence = valence;
                    track.percentage = (valence*100)

                    mood += valence;

                    track.mood = valenceToMood(valence*1000).mood;

                    songlist.mood = round(mood/20, 2);
                    recentlyPlayedPlaceholder.innerHTML = recentlyPlayedTemplate(songlist);
                    
                }
            });

            songlist.tracks.push(track);
            

        });

    }

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {

        console.info("We have a good access token");

        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                $('#login').hide();
                $('#loggedin').show();
            }
        });

        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            headers: {
            'Authorization': 'Bearer ' + access_token
            },
            success: getTrackList
        })
        } else {
            // render initial screen
            $('#login').show();
            $('#loggedin').hide();
        }
    }
    })();

    function round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    function valenceToMood(num) {

        var def = [num];
        var n = [
            {val: 100, mood: '😭'},
            {val: 200, mood: '😢'},
            {val: 300, mood: '😩'},
            {val: 400, mood: '🙁'},
            {val: 500, mood: '😶'},
            {val: 600, mood: '🙂'},
            {val: 700, mood: '😊'},
            {val: 800, mood: '😀'},
            {val: 900, mood: '😂'},
            {val: 1000, mood: '🤣'},
        ];
        
        var result = [];
        
        for (var i = 0; i < def.length; i++){
            var val = def[i];
            for (var j = 0; j < n.length; j++){
                var nVal = n[j];                
                if (nVal.val > val){
                    var closest = n[j-1] == undefined ? nVal : 
                        nVal - val > val - n[j-1].val ? n[j-1] : nVal;
                    
                    result.push(closest);
                    break;
                }    
            }
        }
            
        return result[0];
    }

    function testA11y() {
        var errorSource = document.getElementById('error-message-template').innerHTML,
        errorTemplate = Handlebars.compile(errorSource),
        errorPlaceholder = document.getElementById('test-results');

        axe.run(function(err, results) {

            if (err) throw err;

            if (results.violations.length === 0) {
            console.log('No violations');
            } else {
            console.log("Violations:");

            errorPlaceholder.innerHTML = errorTemplate(results.violations);

            $.each(results.violations, function(i, item) {
                console.log(item);
            }); 

            }
        });
    }