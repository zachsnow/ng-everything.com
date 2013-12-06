ng-everything.com
=================

Dependencies
------------

    $ npm install

Developing locally
------------------

First start a watcher to recompile your files as they change: 
    
    $ grunt watch

Then start a server in the `deploy/` directory:

    $ cd deploy/
    $ python -m SimpleHTTPServer

Deploying
---------

First build a production release.

    $ grunt production

Then do something or another, not sure what yet.    