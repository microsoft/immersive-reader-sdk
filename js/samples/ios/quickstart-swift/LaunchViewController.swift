import UIKit

class LaunchViewController: UIViewController {
    private var tenantId = ProcessInfo.processInfo.environment["TENANT_ID"]
    private var clientId = ProcessInfo.processInfo.environment["CLIENT_ID"]
    private var clientSecret = ProcessInfo.processInfo.environment["CLIENT_SECRET"]
    private var subdomain = ProcessInfo.processInfo.environment["SUBDOMAIN"]

    private var launchButton: UIButton!
    private var titleText: UILabel!
    private var bodyText: UILabel!
    private var sampleContent: Content!
    private var sampleChunk: Chunk!
    private var sampleOptions: Options!
    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .white

        titleText = UILabel()
        titleText.text = "Geography"
        titleText.font = UIFont.boldSystemFont(ofSize: 30)
        titleText.lineBreakMode = .byWordWrapping
        titleText.numberOfLines = 0
        view.addSubview(titleText)

        bodyText = UILabel()
        bodyText.text = "The study of Earth's landforms is called physical geography. Landforms can be mountains and valleys. They can also be glaciers, lakes or rivers. Landforms are sometimes called physical features. It is important for students to know about the physical geography of Earth. The seasons, the atmosphere and all the natural processes of Earth affect where people are able to live. Geography is one of a combination of factors that people use to decide where they want to live.The physical features of a region are often rich in resources. Within a nation, mountain ranges become natural borders for settlement areas. In the U.S., major mountain ranges are the Sierra Nevada, the Rocky Mountains, and the Appalachians.Fresh water sources also influence where people settle. People need water to drink. They also need it for washing. Throughout history, people have settled near fresh water. Living near a water source helps ensure that people have the water they need. There was an added bonus, too. Water could be used as a travel route for people and goods. Many Americans live near popular water sources, such as the Mississippi River, the Colorado River and the Great Lakes.Mountains and deserts have been settled by fewer people than the plains areas. However, they have valuable resources of their own."
        bodyText.lineBreakMode = .byWordWrapping
        bodyText.numberOfLines = 0
        let screenSize = self.view.frame.height
        if screenSize <= 667 {
            // Font size for smaller iPhones.
            bodyText.font = bodyText.font.withSize(14)

         } else if screenSize <= 812 {
            // Font size for medium iPhones.
            bodyText.font = bodyText.font.withSize(15)

         } else if screenSize <= 896 {
            // Font size for larger iPhones.
            bodyText.font = bodyText.font.withSize(17)

         } else if screenSize <= 1024 {
            // Font size for iPads.
            bodyText.font = bodyText.font.withSize(25)
        } else {
            // Font size for large iPads.
            bodyText.font = bodyText.font.withSize(28)
        }
        view.addSubview(bodyText)

        launchButton = UIButton()
        launchButton.backgroundColor = .darkGray
        launchButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
        launchButton.setTitleColor(.white, for: .normal)
        launchButton.setTitle("Immersive Reader", for: .normal)
        launchButton.addTarget(self, action: #selector(launchImmersiveReaderButton(sender:)), for: .touchUpInside)
        view.addSubview(launchButton)

        let layoutGuide = view.safeAreaLayoutGuide

        titleText.translatesAutoresizingMaskIntoConstraints = false
        titleText.topAnchor.constraint(equalTo: layoutGuide.topAnchor, constant: 20).isActive = true
        titleText.leadingAnchor.constraint(equalTo: layoutGuide.leadingAnchor, constant: 20).isActive = true
        titleText.trailingAnchor.constraint(equalTo: layoutGuide.trailingAnchor, constant: -20).isActive = true

        bodyText.translatesAutoresizingMaskIntoConstraints = false
        bodyText.topAnchor.constraint(equalTo: titleText.bottomAnchor, constant: 15).isActive = true
        bodyText.leadingAnchor.constraint(equalTo: layoutGuide.leadingAnchor, constant: 20).isActive = true
        bodyText.trailingAnchor.constraint(equalTo: layoutGuide.trailingAnchor, constant: -20).isActive = true

        launchButton.translatesAutoresizingMaskIntoConstraints = false
        launchButton.widthAnchor.constraint(equalToConstant: 200).isActive = true
        launchButton.heightAnchor.constraint(equalToConstant: 50).isActive = true
        launchButton.centerXAnchor.constraint(equalTo: layoutGuide.centerXAnchor).isActive = true
        launchButton.bottomAnchor.constraint(equalTo: layoutGuide.bottomAnchor, constant: -10).isActive = true

        // Create content and options.
        sampleChunk = Chunk(content: bodyText.text!, lang: nil, mimeType: nil)
        sampleContent = Content(title: titleText.text!, chunks: [sampleChunk])
        sampleOptions = Options(uiLang: nil, timeout: nil, uiZIndex: nil, hideExitButton: true, preferences: nil)
    }

    @IBAction func launchImmersiveReaderButton(sender: AnyObject) {
        launchButton.isEnabled = false

        // Callback to get token.
        getToken(onSuccess: {cognitiveToken in
            DispatchQueue.main.async {
                let immersiveReaderViewController = ImmersiveReaderViewController(token: cognitiveToken, subdomain: self.subdomain!, content: self.sampleContent, options: self.sampleOptions, delegate: self)
                self.navigationController?.pushViewController(immersiveReaderViewController!, animated: true)
            }
        }, onFailure: { error in
            print("an error occured: \(error)")
        })
    }

    /// Retrieves the token for the Immersive Reader using Azure Active Directory authentication
    ///
    /// - Parameters:
    ///     -onSuccess: A closure that gets called when the token is successfully recieved using Azure Active Directory authentication.
    ///     -theToken: The token for the Immersive Reader recieved using Azure Active Directory authentication.
    ///     -onFailure: A closure that gets called when the token fails to be obtained from the Azure Active Directory Authentication.
    ///     -theError: The error that occured when the token fails to be obtained from the Azure Active Directory Authentication.
    func getToken(onSuccess: @escaping (_ theToken: String) -> Void, onFailure: @escaping ( _ theError: String) -> Void) {
        let tokenForm = "grant_type=client_credentials&resource=https://cognitiveservices.azure.com/&client_id=" + self.clientId! + "&client_secret=" + self.clientSecret!
        let tokenUrl = "https://login.windows.net/" + self.tenantId! + "/oauth2/token"

        var responseTokenString: String = "0"

        let url = URL(string: tokenUrl)!
        var request = URLRequest(url: url)
        request.httpBody = tokenForm.data(using: .utf8)
        request.httpMethod = "POST"

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data,
                let response = response as? HTTPURLResponse,
                error == nil else {
                    onFailure("Error")
                    return
                }

            guard (200 ... 299) ~= response.statusCode else {
                onFailure(String(response.statusCode))
                return
            }

            let jsonResponse = try? JSONSerialization.jsonObject(with: data, options: [])
            
            guard let jsonDictonary = jsonResponse as? [String: Any] else {
                onFailure("Error parsing JSON response.")
                return
            }
            guard let responseToken = jsonDictonary["access_token"] as? String else {
                onFailure("Error retrieving token from JSON response.")
                return
            }
            responseTokenString = responseToken
            onSuccess(responseTokenString)
        }

        task.resume()
    }
}

extension  LaunchViewController: ImmersiveReaderDelegate {
    // Called by Immersive Reader application back button tap when not hidden.
    // Not called when iOS Back Bar Button is tapped.
    func didExitImmersiveReader() {
        self.launchButton.isEnabled = true
        print("Exited from Immersive reader")
    }

    func didFinishLaunching(_ error: Error?) {
        if let error = error {
            //failure
            print("Failed to launch Immersive reader, due to error: \(String(describing: error))")
            DispatchQueue.main.async {
                self.launchButton.isEnabled = true
                self.navigationController?.popViewController(animated: true)
            }
            return
        }
        //success
        print("successfully launched Immersive reader")
        DispatchQueue.main.async {
            self.launchButton.isEnabled = false
        }
    }
}
