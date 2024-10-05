function getTokenAsync() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "/getAuthTokenServlet",
      type: "GET",
      success: function (response) {
        const data = response;
        if (data.error) {
          reject(data.error);
        } else {
          const token = data["access_token"];
          resolve({ token });
        }
      },
      error: function (err) {
        reject(err);
      },
    });
  });
}
