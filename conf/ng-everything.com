<VirtualHost *:80>
    # Static stuff
    Alias /static/ /srv/www/ng-everything.com/site/website/serve/
    
    <Directory /srv/www/ng-everything.com/site>
        Order allow,deny
        Allow from all
    </Directory>

    ServerName ng-everything.com
    ServerAlias www.ng-everything.com
    ErrorLog /srv/www/ng-everything.com/logs/error.log                     
    CustomLog /srv/www/ng-everything.com/logs/access.log combined

    WSGIScriptAlias / /srv/www/ng-everything.com/site/server/wsgi/django.wsgi
    WSGIDaemonProcess ng-everything threads=15 display-name=%{GROUP}
    WSGIProcessGroup ng-everything
</VirtualHost>
