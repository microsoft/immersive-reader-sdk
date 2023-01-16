function getTokenAndLaunch() {

    getTokenFromAzureFunction(
        function (response) {
            launchInternal(response.subdomain, response.token);
        },
        function (errorMessage) {
            console.log(errorMessage);
        }
    );
}

function getTokenFromAzureFunction(onsuccess, onerror) {
    // Calling Azure function to get Azure AD token
    // Function URL example: https://<function-name>.azurewebsites.net/api/<method-name>
    var tokenUrl =  (tokenFrom == 'local') ? functionLocalUrl : functionUrl;

    $.ajax(tokenUrl, {
        method: 'GET',
        data: { "code" : functionApiKey },
        success: function (data) {
            onsuccess(data);
        },
        error: function (xhr, status, error) {
            var failureMessage = "GetToken error: " + status + " - " + error;
            onerror(failureMessage);
        }
    });
}

function launchInternal(subdomain, token) {

    const data = {
        title: $("#ir-title").text(),
        chunks: [{
            content: $("#ir-content").html(),
            mimeType: "text/html"
        }]
    };

    const options = {
        "onExit": exitCallback
    };

    ImmersiveReader.launchAsync(token, subdomain, data, options)
        .catch(function (error) {
            alert("Error in launching the Immersive Reader. Check the console.");
            console.log(error);
        });
}

function exitCallback() {
    console.log("This is the callback function. It is executed when the Immersive Reader closes.");
}