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