# ImmersiveReaderView control for UWP


The ImmersiveReaderView control is a Windows Runtime component that allows you to easily and quickly integrate the [Immersive Reader](https://azure.microsoft.com/services/cognitive-services/immersive-reader/) into your UWP application.

## Usage

Usage of this SDK requires an Azure subscription to Immersive Reader. Follow [these instructions](https://docs.microsoft.com/azure/cognitive-services/immersive-reader/how-to-create-immersive-reader) to create an Immersive Reader resource and configure Azure Active Directory authentication. Save the output of your session into a text file for future reference.

For sample usage, launch the `ImmersiveReader.sln` file in Visual Studio 2019. Ensure that you have the UWP development tooling installed. Note that ImmersiveReaderView only supports the Fall Creator's Update (16299) or higher.

Press `F5` to run the sample application. Enter your Azure information into the sample app and click the `Start immersive reader` button.