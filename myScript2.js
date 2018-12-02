let gui;

window.onload =  () =>
{
    let sphereR = 10;
    let pointsCount = 100000;
    // GUI
    var robotControllVars = function() {
        // this.yellowX = 0;
        // this.animation = animate;
      };
      
    var robotVars = new robotControllVars();
    var gui = new dat.GUI();
    // gui.add(robotVars, 'yellowX', -7, 7).listen();
    // gui.add(robotVars, 'animation');

    // Setup
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 500 );
    camera.position.z = 30;

    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 1 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.querySelector('#container').appendChild( renderer.domElement );
    // Controls
    var orbit = new THREE.OrbitControls( camera, renderer.domElement );
    orbit.enableZoom = true;
    // Lights
    var lights = [];
    lights[ 0 ] = new THREE.DirectionalLight( 0xffffff );
    lights[ 1 ] = new THREE.SpotLight( 0xffffff);


    lights[ 0 ].position.set( -100, -100, 0 );
    lights[ 1 ].position.set( 100, 100, 100 );

    scene.add( lights[ 0 ] );
    scene.add( lights[ 1 ] );

    // Shapes
    var texture = new THREE.TextureLoader().load( "texture.png" );
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set( 10, 10 );
    let points = generatePoints(pointsCount,sphereR);

    var geometry = new THREE.ConvexGeometry( points);
    assignUVs(geometry);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.FrontSide
      });
    var mesh = new THREE.Mesh( geometry, material );
    mesh.scale.x = -1;
    scene.add( mesh );

    var pointsMaterial = new THREE.PointsMaterial( {
        color: 0x0080ff,
        size: 1,
        alphaTest: 0.5
    } );

    let group = new THREE.Group();
    var pointsGeometry = new THREE.BufferGeometry().setFromPoints( points );
    var pointsInScene = new THREE.Points( pointsGeometry, pointsMaterial );
    group.add( pointsInScene );
    //scene.add(group);
  
    // End of Shapes

    // Render
    let render = () =>
    {
        renderer.render( scene, camera );
        requestAnimationFrame( render );
    };

    window.addEventListener( 'resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }, false );

    render();

}

let generatePoints = (pointsCount, R) =>
{
    let points = [];
    for (let i = 0; i < pointsCount; i++) 
    {
        let currentR = R*R;
        let x = getRandomArbitrary(0,currentR);
        
        currentR = currentR - Math.abs(x);
        

        let y = getRandomArbitrary(0,currentR);

        currentR = currentR - Math.abs(y);

        let z = currentR;

        z = Math.sqrt(z);
        y = Math.sqrt(y);
        x = Math.sqrt(x);

        if (Math.random() > 0.5)
        {
            x *= (-1);
        }
        if (Math.random() > 0.5)
        {
            y *= (-1);
        }
        if (Math.random() > 0.5)
        {
            z *= (-1);
        }
        let logR = Math.abs(x)+Math.abs(y)+Math.abs(z);
        points.push(new THREE.Vector3( x, y, z ));
        //console.log("x= " + x + " y= " + y + " z= " + z + " r= " + logR);
    }
    return points;
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Next functions are based on the code found at https://codepen.io/knee-cola/pen/XMVBwQ

function assignUVs(geometry) {

    // This function is based on the code found at (the original source doesn't work well)
    // http://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
    // 
    // She following page explains how UV map should be calculated
    // https://solutiondesign.com/blog/-/blogs/webgl-and-three-js-texture-mappi-1/
    // 
    // The following documentation shows what a apherical UV map should look like
    // https://threejs.org/examples/#misc_uv_tests
  
    // converting all vertices into polar coordinates    
    var polarVertices = geometry.vertices.map(cartesian2polar);
    
    geometry.faceVertexUvs[0] = []; // This clears out any UV mapping that may have already existed on the object
  
    // walking through all the faces defined by the object
    // ... we need to define a UV map for each of them
    geometry.faces.forEach(function(face) {
  
        var uvs = [];

        // Each face is a triangle defined by three points or vertices (point a, b and c).
        // Instead of storing the three points (vertices) by itself,
        // a face uses points from the [vertices] array.
        // The 'a', 'b' and 'c' properties of the [face] object in fact represent
        // index at which each of the three points is stored in the [vertices] array
        var ids = [ 'a', 'b', 'c'];

        for( var i = 0; i < ids.length; i++ ) {

            // using the point to access the vertice
            var vertexIndex = face[ ids[ i ] ];
            var vertex = polarVertices[ vertexIndex ];

            // If the vertice is located at the top or the bottom
            // of the sphere, the x coordinates will always be 0
            // This isn't good, since it will make all the faces
            // which meet at this point use the same starting point
            // for their texture ...
            // this is a bit difficult to explainm, so try to comment out
            // the following block and take look at the top of the
            // spehere to see how it is mapped. Also have a look
            // at the following image: https://dev.ngit.hr/vr/textures/sphere-uv.png
            // if(vertex.theta === 0 && (vertex.phi === 0 || vertex.phi === Math.PI)) {

            // // at the sphere bottom and at the top different
            // // points are alligned differently - have a look at the
            // // following image https://dev.ngit.hr/vr/textures/sphere-uv.png
            // var alignedVertice = vertex.phi === 0 ? face.b : face.a;

            // vertex = {
            //     phi: vertex.phi,
            //     theta: polarVertices[ alignedVertice ].theta
            // };
            // }

            // // Fixing vertices, which close the gap in the circle
            // // These are the last vertices in a row, and are at identical position as
            // // vertices which are at the first position in the row.
            // // This causes the [theta] angle to be miscalculated
            // if(vertex.theta === Math.PI && cartesian2polar(face.normal).theta < Math.PI/2) {
            // vertex.theta = -Math.PI;
            // }

            var canvasPoint = polar2canvas(vertex);

            uvs.push( new THREE.Vector2( /* 1 - */ canvasPoint.x,/* 1 - */  canvasPoint.y ) );
        }
  
        geometry.faceVertexUvs[ 0 ].push( uvs );
    });
    geometry.uvsNeedUpdate = true;
} 
  
function cartesian2polar(position){
    var r=Math.sqrt(position.x*position.x + position.z*position.z + position.y*position.y);

    return({
    r: r,  
    phi:Math.acos(position.y / r),
    theta:Math.atan2(position.z, position.x)
    });
}
  
function polar2cartesian(polar){
    return({
        x: polar.distance * Math.cos(polar.radians),
        z: polar.distance * Math.sin(polar.radians)
    });
}
  
function polar2canvas(polarPoint) {
    return({
        y: polarPoint.phi/Math.PI,
        x: (polarPoint.theta+Math.PI) / (2*Math.PI)
    })
}
