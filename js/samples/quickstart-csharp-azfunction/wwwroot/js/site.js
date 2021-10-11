function getTokenAndLaunch() {

    getTokenAzure(
        function (response) {
            launchInternal(response.subdomain, response.token);
        },
        function (errorMessage) {
            console.log(errorMessage);
        }
    );
}

function getTokenAzure(onsuccess, onerror) {
    // Calling Azure function to get AD token
    // Function URL example: https://<function-name>.azurewebsites.net/api/<method-name>
    var tokenUrl = '<your_function_url>';

    $.ajax(tokenUrl, {
        method: 'GET',
        beforeSend: function (request) {
            request.setRequestHeader("x-functions-key", "<your-function-code>");
        },
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
        "onExit": exitCallback,
        "uiZIndex": 2000
    };

    ImmersiveReader.launchAsync(token, subdomain, data, options)
        .catch(function (error) {
            alert("Error in launching the Immersive Reader. Check the console.");
            console.log(error);
        });

    console.log(options);
}

function exitCallback() {
    console.log("This is the callback function. It is executed when the Immersive Reader closes.");
}