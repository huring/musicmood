

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

        $(response.items).each(function(i, item) {
            var track = {};

            track.id = item.track.id;
            track.artist = item.track.artists[0].name;
            track.song = item.track.name.substring(0, 30);
            track.album = item.track.album.name.substring(0, 20);
            track.coverart = item.track.album.images[1].url;
            track.link = item.track.external_urls.spotify

            console.log(track.link);

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

                    if (valence <= 0.3) {
                        track.mood = "😢"
                        track.class = "progress-bar-danger"
                    } else if (valence <= 0.5){
                        track.mood = "😐"
                        track.class = "progress-bar-warning"
                    } else {
                        track.mood = "😀"
                        track.class = "progress-bar-success"
                    }

                    songlist.mood = round(mood/20, 2);
                    recentlyPlayedPlaceholder.innerHTML = recentlyPlayedTemplate(songlist);
           
                    console.log(songlist);  
           
                }
            });

            songlist.tracks.push(track);

        });
        

        // recentlyPlayedPlaceholder.innerHTML = recentlyPlayedTemplate(songlist);
    }

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {

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