let gui;

window.onload =  () =>
{
    let sphereR = 10;
    let pointsCount = 10000;
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
    // helpers
    scene.add( new THREE.AxesHelper( 20 ) );

    // Shapes
    var texture = new THREE.TextureLoader().load( "texture.png" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 2, 2 );
    let points = generatePoints(pointsCount,sphereR);

    var geometry = new THREE.ConvexGeometry( points);
    assignUVs(geometry);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.FrontSide,
        opacity: 1,
        transparent: true
      });
    var mesh = new THREE.Mesh( geometry, material );
    mesh.scale.x = -1;
    scene.add( mesh );

    var edges = new THREE.EdgesGeometry( geometry );
    var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x0080ff, size: 0.01, } ) );
    //scene.add( line );

    var pointsMaterial = new THREE.PointsMaterial( {
        color: 0x0080ff,
        size: 0.1,
        alphaTest: 0.5,
        opacity: 0.5,
        transparent: true
    } );

    let group = new THREE.Group();
    var pointsGeometry = new THREE.BufferGeometry().setFromPoints( points );
    var pointsInScene = new THREE.Points( pointsGeometry, pointsMaterial );
    //group.add( pointsInScene );
    scene.add(group);
  
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
  
    // converting all vertices into polar coordinates    
    var polarVertices = geometry.vertices.map(cartesian2polar);
    
    geometry.faceVertexUvs[0] = []; // This clears out any UV mapping that may have already existed on the object
  
    // walking through all the faces defined by the object
    // ... we need to define a UV map for each of them
    geometry.faces.forEach(function(face) {
  
        var uvs = [];

        // using the point to access the vertice
        var vertexIndex = face[ 'a' ];
        var vertex = polarVertices[ vertexIndex ];   

        var canvasPoint1 = polar2canvas(vertex);

        // using the point to access the vertice
        var vertexIndex = face[ 'b'];
        var vertex = polarVertices[ vertexIndex ];

        var canvasPoint2 = polar2canvas(vertex);

        var vertexIndex = face[ 'c' ];
        var vertex = polarVertices[ vertexIndex ];

        var canvasPoint3 = polar2canvas(vertex);

        let shiftAmount = 0.1;

        let changed = true;
        while (changed)
        {
            changed = false;
        
            if (Math.abs(canvasPoint1.x - canvasPoint2.x) > shiftAmount
            && Math.abs(canvasPoint1.x - canvasPoint3.x) > shiftAmount)
            {
                changed= true;
                if (canvasPoint1.x > canvasPoint2.x)
                {
                    canvasPoint1.x -= shiftAmount;
                }
                else
                {
                    canvasPoint1.x += shiftAmount;
                }

            }
            else if (Math.abs(canvasPoint2.x - canvasPoint3.x) > shiftAmount
            && Math.abs(canvasPoint2.x - canvasPoint1.x) > shiftAmount)
            {
                changed= true;
                if (canvasPoint2.x > canvasPoint1.x)
                {
                    canvasPoint2.x -= shiftAmount;
                }
                else
                {
                    canvasPoint2.x += shiftAmount;
                }
            }
            else if (Math.abs(canvasPoint3.x - canvasPoint1.x) > shiftAmount
            && Math.abs(canvasPoint3.x - canvasPoint2.x) > shiftAmount)
            {
                changed= true;
                if (canvasPoint3.x > canvasPoint1.x)
                {
                    canvasPoint3.x -= shiftAmount;
                }
                else
                {
                    canvasPoint3.x += shiftAmount;
                }
            }
        }


        uvs.push( new THREE.Vector2( canvasPoint1.x, canvasPoint1.y ) );
        uvs.push( new THREE.Vector2(  canvasPoint2.x,canvasPoint2.y ) );
        uvs.push( new THREE.Vector2( canvasPoint3.x,canvasPoint3.y ) );
  
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

function distanceAB(x1,y1,x2,y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt( a*a + b*b );
}
