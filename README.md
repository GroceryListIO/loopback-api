# My Application

The project is generated by [LoopBack](http://loopback.io).

## Secured configuration
Install travis command line
  sudo gem install travis

Login to travis
  travis login

tar the files
  tar cvf secrets.tar client-secret.json server/datasources.production.json

encrypt the files
  travis encrypt-file secrets.tar

