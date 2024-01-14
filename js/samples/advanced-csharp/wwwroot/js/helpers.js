function getImmersiveReaderTokenAsync(canary) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/token',
            type: 'POST',
            contentType: 'text/plain',
            data: canary,
            success: token => {
                resolve(token);
            },
            error: err => {
                console.log('Error in getting token!', err);
                reject(err);
            }
        });
    });
}

function getImmersiveReaderSubdomainAsync() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/subdomain',
            type: 'GET',
            success: subdomain => {
                resolve(subdomain);
            },
            error: err => {
                console.log('Error in getting subdomain!', err);
                reject(err);
            }
        });
    });
}

let handleError = (error, caller) => {

    let alertMessage = `Error in ${caller === 'token' ? 'getting the Immersive Reader token' : 'launching the Immersive Reader'}. Check the console.`
    let errorStatus = error.status ?? 'unknown';
    let errorStatusText = error.statusText ?? 'unknown';
    let errorMessage = error.message ?? 'unknown';
    let errorSessionId = error.sessionId ?? 'unknown'; // Customers can report this sessionId to Immersive Reader team for further debugging.
    let errorMessageToLog = `Error - Status: ${errorStatus}, StatusText: ${errorStatusText}, Message: ${errorMessage}, SessionId: ${errorSessionId}`;

    console.log(errorMessageToLog);

    alert(alertMessage);
}