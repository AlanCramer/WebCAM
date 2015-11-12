
//todo global pollution!
var container;

var camera, scene, renderer;

var group, text, plane;

var targetXRotation = 0;
var targetXRotationOnMouseDown = 0;
var targetYRotation = 0;
var targetYRotationOnMouseDown = 0;

var mouseX = 0;
var mouseY = 0;
var mouseXOnMouseDown = 0;
var mouseYOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

//init();
//animate();

function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {


//    var spacedPoints = shape.createSpacedPointsGeometry( 100 );

    // flat shape

    var geometry = new THREE.ShapeGeometry( shape );

    var material = new THREE.MeshLambertMaterial( { color: 0x000000 } );
    material.side = THREE.DoubleSide;
    
    var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ material ]);//, new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
    mesh.position.set( x, y, z - 50 );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    group.add( mesh );

    // 3d shape

    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

    var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: color } )]);//, new THREE.MeshBasicMaterial( { color: color, wireframe: true, transparent: true } ) ] );
    mesh.position.set( x, y, z );
    mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    group.add( mesh );

    return mesh;
}

function addLine(shape, color, x, y, z, rx, ry, rz, s) {
    // solid line
    var points = shape.createPointsGeometry();
    
    var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: 2 } ) );
    line.position.set( x, y, z );
    line.rotation.set( rx, ry, rz );
    line.scale.set( s, s, s );
    group.add( line );


}

function buildContainer() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // var info = document.createElement( 'div' );
    // info.style.position = 'absolute';
    // info.style.top = '10px';
    // info.style.width = '100%';
    // info.style.textAlign = 'center';
    // info.innerHTML = 'Hacked by Alan';
    // container.appendChild( info );
}

function init() {

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 100, 500 );

    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    group = new THREE.Object3D();

    scene.add( group );

    // axes
    axes = new THREE.AxisHelper( 100 );
    scene.add( axes );
     
    // TODO 3d path?

    var apath = new THREE.SplineCurve3();
    apath.points.push(new THREE.Vector3(-50, 150, 10));
    apath.points.push(new THREE.Vector3(-20, 180, 20));
    apath.points.push(new THREE.Vector3(40, 220, 50));
    apath.points.push(new THREE.Vector3(200, 290, 100));

    var extrudeSettings = { amount: 20 }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5

    extrudeSettings.bevelEnabled = true;
    extrudeSettings.bevelSegments = 2;
    extrudeSettings.steps = 2;

        // this plus a call in animate gets the trackball controls going.     
        // controls = new THREE.TrackballControls( camera );

        // controls.rotateSpeed = 2.0;
        // controls.zoomSpeed = 1.2;
        // controls.panSpeed = 0.8;

        // controls.noZoom = false;
        // controls.noPan = false;

        // controls.staticMoving = true;
        // controls.dynamicDampingFactor = 0.3;

        // controls.keys = [ 65, 83, 68 ];

        // controls.addEventListener( 'change', render );

    // or this gets orbit controls going - but all mouse events are taken - not
    // just the ones in the div
    // controls = new THREE.OrbitControls( camera );
    // controls.addEventListener( 'change', render );


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( 600, 600 );

    container.appendChild( renderer.domElement );

    container.addEventListener( 'mousedown', onDocumentMouseDown, false );
    container.addEventListener( 'touchstart', onDocumentTouchStart, false );
    container.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function onDocumentMouseDown( event ) {

    event.preventDefault();

    container.addEventListener( 'mousemove', onDocumentMouseMove, false );
    container.addEventListener( 'mouseup', onDocumentMouseUp, false );
    container.addEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;

    targetXRotationOnMouseDown = targetXRotation;
    targetYRotationOnMouseDown = targetYRotation;

}

function onDocumentMouseMove( event ) {

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

    targetXRotation = targetXRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
    targetYRotation = targetYRotationOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.02;
}

function onDocumentMouseUp( event ) {

    container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    container.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {

    container.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    container.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    container.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
        targetXRotationOnMouseDown = targetXRotation;
        targetYRotationOnMouseDown = targetYRotation;
    }

}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        targetXRotation = targetXRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

    }

}

function animate() {

    requestAnimationFrame( animate );

    render();
}

function render() {

    group.rotation.y += ( targetXRotation - group.rotation.y ) * 0.05;
    group.rotation.x += ( targetYRotation - group.rotation.x ) * 0.05;
    
    //group.rotation.z += ( targetXRotation - group.rotation.z ) * 0.05;

    renderer.render( scene, camera );

}