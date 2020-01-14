Pod::Spec.new do |spec|
  spec.name         = "immersive-reader-sdk"
  spec.version      = "1.0.0"
  spec.summary      = "Microsoft Cognitive Services - Immersive Reader iOS SDK"

  spec.description  = <<-DESC
                      Integrate Microsoft Cognitive Services Immersive Reader iOS SDK into your iOS App.
                   DESC
  spec.homepage     = "https://github.com/microsoft/immersive-reader-sdk/iOS"
  spec.license      = "MIT"
  spec.author       = { "Immersive Reader SDK" => "irsdk@microsoft.com" }
  spec.platform     = :ios, "9.0"

  spec.source       = { :git => "https://github.com/microsoft/immersive-reader-sdk.git", :tag => "legacy-ios" }
  spec.source_files = ["iOS/immersive-reader-sdk/immersive-reader-sdk/ImmersiveReaderViewController.swift", "iOS/immersive-reader-sdk/immersive-reader-sdk/LaunchImmersiveReader.swift", "iOS/immersive-reader-sdk/immersive-reader-sdk/TestingHandler.swift", "iOS/immersive-reader-sdk/immersive-reader-sdk/immersive_reader_sdk.h"]

 spec.resource_bundles = {
    'immersive-reader-sdk' => ['iOS/immersive-reader-sdk/immersive-reader-sdk/Resources/TestPage.html', 'iOS/immersive-reader-sdk/immersive-reader-sdk/Resources/iFrameMessaging.js']
  }
 spec.preserve_paths = "iOS/immersive-reader-sdk/immersive-reader-sdk/Resources/*"

end
