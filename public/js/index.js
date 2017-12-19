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

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {

            console.info("We have a good access token");

            $.ajax({
                url: 'https://www.polaraccesslink.com/v3/users/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Accept':'application/json'
                },
                success: function(response) {
                    
                    console.log(response);
                    
                    // userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                    $('#login').hide();
                    $('#loggedin').show();
                }
            });
        
        } else {
            // render initial screen
            $('#login').show();
            $('#loggedin').hide();
        }
    }
    })();