<%@ page contentType="text/html; charset=UTF-8" %>
<html>
<head>
    <meta charset='utf-8'>
    <title>Immersive Reader Java Quickstart</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script type='text/javascript' src='https://ircdname.azureedge.net/immersivereadersdk/immersive-reader-sdk.1.2.0.js'></script>
    <script type='text/javascript' src='/resources/helpers.js'></script>
    <!-- A polyfill for Promise is needed for IE11 support -->
    <script type='text/javascript' src='https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js'></script>

    <style type="text/css">
        .immersive-reader-button {
            background-color: white;
            margin-top: 5px;
            border: 1px solid black;
            float: right;
        }

        nav {
            margin-top: 10px;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
        }
    </style>
</head>
<body>
    <nav>
        <a href='/'>Home </a>
        <a href='/options.jsp'>Options</a>
    </nav>
    <div class="container">
        <button class="immersive-reader-button" data-button-style="iconAndText" data-locale="en"></button>
    
        <h1 id="ir-title">About Immersive Reader</h1>
        <div id="ir-content" lang="en-us">
            <p>
                Immersive Reader is a tool that implements proven techniques to improve reading comprehension for emerging readers, language learners, and people with learning differences.
                The Immersive Reader is designed to make reading more accessible for everyone. The Immersive Reader
                <ul>
                    <li>
                        Shows content in a minimal reading view
                    </li>
                    <li>
                        Displays pictures of commonly used words
                    </li>
                    <li>
                        Highlights nouns, verbs, adjectives, and adverbs
                    </li>
                    <li>
                        Reads your content out loud to you
                    </li>
                    <li>
                        Translates your content into another language
                    </li>
                    <li>
                        Breaks down words into syllables
                    </li>
                </ul>
            </p>
            <h3>
                The Immersive Reader is available in many languages.
            </h3>
            <p lang="es-es">
                El Lector inmersivo está disponible en varios idiomas.
            </p>
            <p lang="zh-cn">
                沉浸式阅读器支持许多语言
            </p>
            <p lang="de-de">
                Der plastische Reader ist in vielen Sprachen verfügbar.
            </p>
            <p lang="ar-eg" dir="rtl" style="text-align:right">
                يتوفر \"القارئ الشامل\" في العديد من اللغات.
            </p>
        </div>
    </div>

    <script type='text/javascript'>
        
        $(".immersive-reader-button").click(function () {
            handleLaunchImmersiveReader();
        });

        function handleLaunchImmersiveReader() {
            getTokenAsync()
                .then(function (response) {
                    const token = response["token"];
                    const subdomain = '<%= Microsoft.ImmersiveReader.GetAuthTokenServlet.SUBDOMAIN %>';
                    // Learn more about chunk usage and supported MIME types https://docs.microsoft.com/azure/cognitive-services/immersive-reader/reference#chunk
                    const data = {
                        title: $("#ir-title").text(),
                        chunks: [{
                            content: $("#ir-content").html(),
                            mimeType: "text/html"
                        }]
                    };
                    // Learn more about options https://docs.microsoft.com/azure/cognitive-services/immersive-reader/reference#options
                    const options = {
                        "onExit": exitCallback,
                        "uiZIndex": 2000
                    };
                    ImmersiveReader.launchAsync(token, subdomain, data, options)
                        .catch(function (error) {
                            console.log(error);
                            alert("Error in launching the Immersive Reader. Check the console.");
                        });
                })
                .catch(function (error) {
                    console.log(error);
                    alert("Error in getting the Immersive Reader token and subdomain. Check the console.");
                });
        }

        function exitCallback() {
            console.log("This is the callback function. It is executed when the Immersive Reader closes.");
        }
    </script>
</body>
</html>