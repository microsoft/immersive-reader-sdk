function getTokenAsync() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "/getAuthTokenServlet",
      type: "GET",
      success: function (response) {
        let data = response;
        if (data.error) {
          reject(data.error);
        } else {
          // decode token
          const decodedData = data
              .replace(/\\"/g, '"')   // Unescape escaped quotes
              .replace(/\\\\/g, '\\'); // Unescape escaped backslashes
          data = JSON.parse(decodedData);
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
