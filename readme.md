This repo has some resources for setting up a heroku server that uses node.js to communicate with a locally running p5 sketch and a local node server to control an arduino

notes:

in sketch.js, a different server address will be needed: socket = io.connect(''); //for heroku
