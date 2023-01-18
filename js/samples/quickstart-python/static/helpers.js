function getTokenAndSubdomainAsync() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "/GetTokenAndSubdomain",
            type: "GET",
            success: function (data) {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data);
                }
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}