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