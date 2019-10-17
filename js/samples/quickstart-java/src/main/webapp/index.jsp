<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title> - QuickstartSampleWebApp</title>
        <link rel="stylesheet" href="/resources/bootstrap.css" />
        <link rel="stylesheet" href="/resources/site.css" />
        <script type='text/javascript' src='https://contentstorage.onenote.office.net/onenoteltir/immersivereadersdk/immersive-reader-sdk.0.0.3.js'></script>
</head>
<body>
    <nav class="navbar navbar-inverse navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="/">QuickstartSampleWebApp</a>
            </div>
            <div class="navbar-collapse collapse">
                <ul class="nav navbar-nav">
                    <li><a href="/">Home</a></li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="container body-content">

    <meta name='viewport' content='width=device-width, initial-scale=1'>

    <h1 id='title'>Geography</h1>
    <span id='content'>
        <p>The study of Earth's landforms is called physical geography. Landforms can be mountains and valleys. They can also be glaciers, lakes or rivers. Landforms are sometimes called physical features. It is important for students to know about the physical geography of Earth. The seasons, the atmosphere and all the natural processes of Earth affect where people are able to live. Geography is one of a combination of factors that people use to decide where they want to live.</p>
        <p>The physical features of a region are often rich in resources. Within a nation, mountain ranges become natural borders for settlement areas. In the U.S., major mountain ranges are the Sierra Nevada, the Rocky Mountains, and the Appalachians.</p>
        <p>Fresh water sources also influence where people settle. People need water to drink. They also need it for washing. Throughout history, people have settled near fresh water. Living near a water source helps ensure that people have the water they need. There was an added bonus, too. Water could be used as a travel route for people and goods. Many Americans live near popular water sources, such as the Mississippi River, the Colorado River and the Great Lakes.</p>
        <p>Mountains and deserts have been settled by fewer people than the plains areas. However, they have valuable resources of their own.</p>
    </span>

    <button onclick='handleLaunchImmersiveReader()'>
        Immersive Reader
    </button>

    <script type='text/javascript'>
        function getImmersiveReaderTokenAsync() {
          return new Promise((resolve, reject) => {
              $.ajax({
                  url: '/getAuthTokenServlet',
                  type: 'GET',
                  success: token => {
                      resolve(JSON.parse(token).access_token);
                  },
                  error: err => {
                      console.log('Error in getting token!', err);
                      reject(err);
                  }
              });
          });

        }

        async function handleLaunchImmersiveReader() {
            const data = {
                title: document.getElementById('title').innerText,
                chunks: [ {
                    content: document.getElementById('content').innerText,
                    lang: 'en'
                } ]
            };

            const options = {
                uiZIndex: 1000000
            }

            const token = await getImmersiveReaderTokenAsync();

            ImmersiveReader.launchAsync(token, '<%= Microsoft.ImmersiveReader.GetAuthTokenServlet.SUBDOMAIN %>', data, options)
                .then(() => {
                    console.log('success');
                }, (error) => {
                    console.log('error! ' + error);
                });
        }
    </script>
        <hr />
        <footer>
            <p>&copy; 2019 - QuickstartSampleWebApp</p>
        </footer>
    </div>

    <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>

</body>
</html>