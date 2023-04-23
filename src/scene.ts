import { Scene } from "@babylonjs/core/scene";
import { canvas, engine } from "./app";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Color3, Color4, HDRCubeTexture, PBRMaterial, PointLight, SceneLoader, UniversalCamera, WebXRFeatureName } from "@babylonjs/core";
import { voidMaterial } from "./void_material";


export async function createScene(): Promise<Scene>{
    var scene = new Scene(engine);
    var hdrTexture = new HDRCubeTexture("resources/full_hdr_dark.hdr",scene,512);
    scene.clearColor = new Color4(0,0,0,1);
    scene.ambientColor = new Color3(0.3,0.3,0.3);
    scene.createDefaultSkybox(hdrTexture,true, 100000);
    scene.createDefaultEnvironment({
        environmentTexture: hdrTexture,
        skyboxColor: new Color3(0,0,0),
    })
    scene.gravity = new Vector3(0,-8,0);
    
    // var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
    var camera : UniversalCamera = new UniversalCamera("Camera", new Vector3(0,100,-4000), scene);
    camera.maxZ=0;
    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    // var pointlight: PointLight = new PointLight("pointlight", new Vector3(0,-3,0), scene);
    var pointlight: PointLight = new PointLight("pointlight", new Vector3(0,-30,0), scene);
    // pointlight.intensity = 1000;
    pointlight.intensity = 1000000;

    var thevoid = await SceneLoader.ImportMeshAsync("Circle", "resources/", "void.glb");
    thevoid.meshes[1].material = voidMaterial();
    thevoid.meshes[1].position.subtractInPlace(new Vector3(0,150,0));
    thevoid.meshes[1].checkCollisions = true;

    // var pbr = new PBRMaterial("pbr", scene);
    // pbr.albedoColor = Color3.FromHSV(0,0,0).toLinearSpace();
    // pbr.metallic = 0.8;
    // pbr.roughness = 0.05;    
    // pbr.subSurface.refractionIntensity = 0.8;
    // pbr.subSurface.isRefractionEnabled = true;
    // pbr.subSurface.indexOfRefraction = 1.1;
    // pbr.subSurface.translucencyIntensity = 0.1;
    // pbr.subSurface.isTranslucencyEnabled = true;
    // pbr.clearCoat.isEnabled = true;
    // pbr.sheen.isEnabled = true;
    
    // thevoid.meshes[1].material = pbr;

    thevoid.meshes[1].scaling = new Vector3(1000,1000,1000);
    
    


    window.addEventListener("keydown", (ev) => {
        // Shift+Ctrl+Alt+I
        if (ev.shiftKey && ev.ctrlKey) {
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show();
            }
        }
    });
    
    
    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [thevoid.meshes[1]],
        disableTeleportation: true
    });
    const xr_cam = xr.baseExperience.camera;
    xr_cam.position.set(0, 150, -4000);
    xr_cam.checkCollisions = true;
    xr_cam.applyGravity = true;
    xr_cam.ellipsoid = new Vector3(1,5,1);

    // const feature_manager = xr.baseExperience.featuresManager;
    // const movementFeature = feature_manager.enableFeature(WebXRFeatureName.MOVEMENT, 'latest',{
    //     xrInput: xr.input,
    //     movementOrientationFollowsViewerPose: true,
    //     movementSpeed: 1,
    //     movementThreshold: 1
    // });
    

    scene.registerBeforeRender(()=>{
        update(scene);
        // xr.baseExperience.camera.position.addInPlace(new Vector3(0,0,1));
        if(xr_cam.position.z<0){
            xr_cam.cameraDirection.addInPlaceFromFloats(0,0,0.1*Math.log(Math.abs(xr_cam.position.z)));
        }
        
    });
    scene.registerAfterRender(()=>{
    });
    
    return scene;
}

// scene.deltaTime for frame delta
function update(scene: Scene): void{
    
}
