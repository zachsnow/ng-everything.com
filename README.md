ng-everything.com
=================

Dependencies
------------

0. Node

    $ brew install nodejs

0. Sass

    $ gem install sass


Developing locally
------------------

First get right with `npm`:

    $ npm install

To build the local version of the site, which does not compress Javascript
or SCSS:

    $ grunt

If you are going to be making and testing changes, it's easier to start
a watcher to recompile your files as they change: 
    
    $ grunt watch

Then start a server in the `deploy/` directory; for instance:

    $ cd deploy/
    $ python -m SimpleHTTPServer


Deploying
---------

First build a production release.

    $ grunt production

Then do something or another, not sure what yet.
