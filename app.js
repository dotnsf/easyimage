//.  app.js
var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    easyimg = require( 'easyimage' ),
    ejs = require( 'ejs' ),
    app = express();
var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './tmp/' } ).single( 'data' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.post( '/upload', function( req, res ){
  var filepath = req.file.path;
  var filetype = req.file.mimetype;
  var originalname = req.file.originalname;

  var fileimage = fs.readFileSync( filepath );

  //. https://www.npmjs.com/package/easyimage
  easyimg.info( filepath ).then(
    function( file ){
      var img_type = file.type;
      var img_width = file.width;
      var img_height = file.height;
      var img_size = file.size;

      for( var x = 0; x < img_width; x += Math.ceil(img_width / 2) ){
        for( var y = 0; y < img_height; y += Math.ceil(img_height / 2) ){
          cropImage( filepath, filepath + "_" + x + "_" + y, Math.ceil( img_width / 2 ), Math.ceil( img_height / 2 ), x, y ).then( 
           function( image ){
             console.log( JSON.stringify( image, 2, null ) );
             fs.unlink( filepath, function(e){} );
             //fs.unlink( filepath + "_" + x + "_" + y, function(e){} );
           },
           function( error ){
             console.log( error );
             fs.unlink( filepath, function(e){} );
           }
          );
        }
      }

      res.write( JSON.stringify( {status:true, file: file }, 2, null ) );
      res.end();
    }, function( error ){
      fs.unlink( filepath, function(e){} );
      res.write( JSON.stringify( {status:false, error: error }, 2, null ) );
      res.end();
    }
  );
});

function cropImage( src, dst, cropwidth, cropheight, x, y ){
  return new Promise( function( resolve, reject ){
    easyimg.crop({
      src: src,
      dst: dst,
      cropwidth: cropwidth,
      cropheight: cropheight,
      x: x,
      y: y
    }).then(
      function( image ){
        resolve( image );
      },
      function( error ){
        reject( error );
      }
    );
  });
}

var port = appEnv.port || 3000;
app.listen( port );
console.log( "server starting on " + port + " ..." );



