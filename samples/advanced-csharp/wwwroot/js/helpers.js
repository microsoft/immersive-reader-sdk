function getImmersiveReaderTokenAsync() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/token',
            type: 'GET',
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