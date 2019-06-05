# Immersive Reader - Python Sample

----------------------------------

## Follow these steps to get the sample up and running

### Installation on Windows

1. Install [Python](https://www.python.org/downloads/). Choose custom installation and set the installation path as your root folder e.g. `C:\Python37-32\`.
2. Open Command Prompt and `cd` to the Python Scripts folder e.g `cd C:\Python37-32\Scripts`.
3. `pip` is the preferred installer program, [Learn more](https://docs.python.org/3/installing/index.html). Starting with Python 3.4, it is included by default with the Python binary installers.
4. Add the path of your pip installation to your PATH variable e.g. `setx PATH "%PATH%;C:\Python37-32\Scripts"`.
5. Install Flask by running `pip install flask`.
6. Install [Jinja](http://jinja.pocoo.org/docs/2.10/intro/#installation), a full featured template engine for Python by running `pip install Jinja2`.
7. Install virtualenv by running `pip install virtualenv`. It's a tool to create isolated Python environments [Learn more](https://virtualenv.pypa.io/en/latest/).
8. Install virtualenvwrapper-win by running `pip install virtualenvwrapper-win`. The idea behind virtualenvwrapper is to ease usage of virtualenv [Learn more](https://pypi.org/project/virtualenvwrapper-win/).
9. Install the [requests module](https://pypi.org/project/requests/2.7.0/) by running `pip install requests`. Requests is an Apache2 Licensed HTTP library, written in Python, for human beings.

#### USAGE

Using [Git](https://git-scm.com/), open a Command Prompt and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:

1. Make a virtual environment by opening a Command Prompt and run `mkvirtualenv advanced-python`.
2. `cd` to the sample project root folder on your local machine e.g. `cd C:\immersive-reader-sdk\samples\advanced-python`.
3. Connect the sample project with the environment by running `setprojectdir .`. This maps the newly created virtual environment to the sample project root folder. The project should now be active and you'll see something like `(advanced-python) C:\immersive-reader-sdk\samples\advanced-python>` in the Command Prompt.
4. To deactivate the environment run `deactivate`. The `(advanced-python)` prefix should now be gone as the environment is now deactivated.
5. To reactivate the environment run `workon advanced-python` from the sample project root folder.
6. Open app.py in a text editor and supply your subscription key and endpoint by editing lines 8 and 9.
7. Run the sample project by entering `flask run` from the sample project root folder.
8. Open a browser and navigate to [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### Installation on OSX

Using [Git](https://git-scm.com/), Launch Terminal and run `git clone https://github.com/Microsoft/immersive-reader-sdk` to a preferred folder then:

1. Install [Python](https://www.python.org/downloads/). The Python root folder e.g. `Python37-32` should now be in the Applications folder.
2. Launch Terminal and `cd` to the project sample folder e.g `cd immersive-reader-sdk/samples/advanced-python`.
3. `pip` is the preferred installer program, [Learn more](https://docs.python.org/3/installing/index.html). Starting with Python 3.4, it is included by default with the Python binary installers. However an easy way to use it from any path is to install Pip for the current user. Launch Terminal and run `curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py`, then run `python get-pip.py --user` to install Pip for the currently signed-in user to avoid permissions issues.
4. Add the path of your pip installation to your PATH variable.
⋅⋅* Launch a new Terminal window.
⋅⋅* Run the following command: `sudo nano /etc/paths`.
⋅⋅* Enter your password, when prompted.
⋅⋅* Go to the bottom of the file, and enter the path you wish to add as the last item of the list e.g. `PATH=$PATH:/usr/local/bin`.
⋅⋅* Hit control-x to quit.
⋅⋅* Enter `Y` to save the modified buffer.
⋅⋅* That's it! To test it, in new terminal window, type: `echo $PATH`.
5. Install Flask by running `pip install flask --user`.
6. Install [Jinja](http://jinja.pocoo.org/docs/2.10/intro/#installation), a full featured template engine for Python by running `pip install Jinja2 --user`.
7. Install virtualenv by running `pip install virtualenv`. It's a tool to create isolated Python environments [Learn more](https://virtualenv.pypa.io/en/latest/).
8. Install virtualenvwrapper by running `pip install virtualenvwrapper`. The idea behind virtualenvwrapper is to ease usage of virtualenv [Learn more](https://virtualenvwrapper.readthedocs.io/en/latest/).
9. Install the [requests module](https://pypi.org/project/requests/2.7.0/) by running `pip install requests --user`. Requests is an Apache2 Licensed HTTP library, written in Python, for human beings.
10. Choose a place where you would like to keep your virtual environments, e.g. `mkdir ~/.virtualenvs`.


#### USAGE

1. `cd` to the sample project root folder on your local machine e.g. `cd C:\immersive-reader-sdk\samples\advanced-python`.
2. Make a virtual environment by launching Terminal and run `mkvirtualenv -p /usr/local/bin/python3 advanced-python`.
3. Open app.py in a text editor and supply your subscription key and endpoint by editing lines 8 and 9.
4. Run the sample project by entering `flask run` from the sample project root folder.
5. Open a browser and navigate to [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.