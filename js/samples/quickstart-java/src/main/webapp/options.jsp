<%@ page contentType="text/html; charset=UTF-8" %>
<html>
<head>
    <meta charset='utf-8'>
    <title>Immersive Reader: SDK options</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>

    <script type='text/javascript' src='https://code.jquery.com/jquery-3.3.1.min.js'></script>
    <script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'></script>
<<<<<<< HEAD
    <script type='text/javascript' src='https://ircdname.azureedge.net/immersivereadersdk/immersive-reader-sdk.1.2.0.js'></script>
=======
    <script type='text/javascript' src='https://ircdname.azureedge.net/immersivereadersdk/immersive-reader-sdk.1.3.0.js'></script>
>>>>>>> master
    <script type='text/javascript' src='/resources/helpers.js'></script>

    <style media='screen' type='text/css'>
        #ContentArea {
            display: block;
            margin: 0 20%;
            padding-top: 50px;
            width: 60%;
        }

        .section {
            border: 1px solid #cccccc;
            border-radius: 4px;
            box-sizing: border-box;
            display: block;
            margin-bottom: 20px;
            padding: 20px 20px 10px 20px;
            position: relative;
            width: 100%;
        }

        #Cols {
            box-sizing: inherit;
            column-count: 1;
            column-gap: 0;
        }

        h3 {
            margin: 0;
            margin-top: 10px;
            padding: 0;
        }

        p {
            line-height: 25px;
        }

        @media screen and (min-width: 900px) {
            #Cols {
                column-gap: 20px;
                column-count: 2;
            }
        }

        nav {
            margin-top: 10px;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
        }

        .immersive-reader-button {
            background-color: white;
            margin-top: 5px;
            border: 1px solid black;
            float: right;
        }
    </style>
</head>
<body class='body'>
    <nav>
        <a href='/'>Home </a>
        <a href='/options.jsp'>Options</a>
    </nav>

    <main id='ContentArea'>
        <h1>You can disable Immersive Reader features as desired!</h1>
        <p>These are some of the features you can disable:</p>
        <p><code>disableGrammar</code> Grammar features such as Syllables, Parts of speech, and Picture Dictionary will be disabled.</p>
        <p><code>disableLanguageDetection</code> The Language Detection feature will be disabled. This will prevent Immersive Reader from automatically detecting the language of the supplied content.</p>
        <p><code>disableTranslation</code> The Translation features will be disabled.</p>
        <p><code>parent</code> Immersive reader iframe is placed the specified element, otherwise it will be placed in the main document body.</p>
        <h3>Examples:</h3><br />
        <section class='section' id='sampleDisableLanguageDetection'>
            <div class='immersive-reader-button ir-button-small' onclick="handleLaunchImmersiveReader('DisableLanguageDetection')"></div>
            Specify the content language: <input id='lang_DisableLanguageDetection' value='en' /> (i.e 'fr', 'es', 'de', 'zh')
            <h3 id='titleDisableLanguageDetection'>Geography (Speech, Syllables, Parts of Speech and Picture Dictionary are all affected by the language.)</h3>
            <p id='textDisableLanguageDetection'>The study of Earth's landforms is called physical geography. Landforms can be mountains and valleys. They can also be glaciers, lakes or rivers. Landforms are sometimes called physical features. It is important for students to know about the physical geography of Earth. The seasons, the atmosphere and all the natural processes of Earth affect where people are able to live. Geography is one of a combination of factors that people use to decide where they want to live.</p>
        </section>
        <div id='Cols'>
            <section class='section' id='sampleDisableGrammar'>
                <div class='immersive-reader-button ir-button-small' onclick="handleLaunchImmersiveReader('DisableGrammar')"></div>
                <h3 id='titleDisableGrammar'>Water (Parts of Speech, Syllables and Picture Dictionary are disabled)</h3>
                <p id='textDisableGrammar'>Fresh water sources also influence where people settle. People need water to drink. They also need it for washing. Throughout history, people have settled near fresh water. Living near a water source helps ensure that people have the water they need.</p>
            </section>
            <section class='section' id='sampleDisableTranslation'>
                <div class='immersive-reader-button ir-button-small' onclick="handleLaunchImmersiveReader('DisableTranslation')"></div>
                <h3 id='titleDisableTranslation'>Mountain Ranges (Translation disabled)</h3>
                <p id='textDisableTranslation'>The physical features of a region are often rich in resources. Within a nation, mountain ranges become natural borders for settlement areas. In the U.S., major mountain ranges are the Sierra Nevada, the Rocky Mountains, and the Appalachians.</p>
            </section>
        </div>
        <section class='section' id='sampleParent'>
            <div class='immersive-reader-button ir-button-small' onclick="handleLaunchImmersiveReader('Parent')"></div>
            <input type="checkbox" id="checkboxParent" name="Parent" value="true">
            <label for="checkboxParent"> Launch in Parent </label><br>
            <h3 id='titleParent'>Kaiju (Displaying in parent)</h3>
            <p id='textParent'>Kaiju is a Japanese genre of films and television featuring giant monsters. The term kaiju can also refer to the giant monsters themselves, which are usually depicted attacking major cities and battling either with the military or other monsters. The kaiju genre is a subgenre of tokusatsu (special filming) entertainment.</p>
            <div id="parentDiv" style="height: 400px; "></div>
        </section>
    </main>

    <script type='text/javascript'>

        async function handleLaunchImmersiveReader(sampleId) {
            getTokenAsync()
                .then(function (response) {
                    const token = response["token"];
                    const subdomain = '<%= Microsoft.ImmersiveReader.GetAuthTokenServlet.SUBDOMAIN %>';
                    
                    var langElement = $('#lang_' + sampleId);
                    var lang = sampleId == 'DisableLanguageDetection' ? langElement.val() : 'en';

                    const data = {
                        title: $('#title' + sampleId).text().trim(),
                        chunks: [{
                            content: $('#text' + sampleId).text().trim(),
                            lang: lang
                        }]
                    };

                    let options = {};

                    options.disableLanguageDetection = sampleId === 'DisableLanguageDetection';
                    options.disableGrammar = sampleId === 'DisableGrammar';
                    options.disableTranslation = sampleId === 'DisableTranslation';
                    options.parent = sampleId === 'Parent' && document.getElementById("checkboxParent").checked ? document.getElementById('parentDiv') : null;

                    ImmersiveReader.launchAsync(token, subdomain, data, options);
                })
                .catch(function (error) {
                    console.log(error);
                    alert("Error in getting the Immersive Reader token. Check the console.");
                });
        }
    </script>
</body>
</html>