import { Scene } from "@babylonjs/core/scene";
import { canvas, engine } from "./app";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Animation, Camera, Color3, Color4, HDRCubeTexture, PBRMaterial, Plane, PointLight, SceneLoader, Sound, UniversalCamera, WebXRFeatureName } from "@babylonjs/core";
import { voidMaterial } from "./void_material";
import { AdvancedDynamicTexture, Button } from "@babylonjs/gui/2D";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";

var scene: Scene;
var animations: Animation[];
var UI: AdvancedDynamicTexture;
var buttons: AdvancedDynamicTexture;
var fadeout = false;
var plane: Mesh;

export async function createScene(): Promise<Scene>{
    scene = new Scene(engine);
    const hdrTexture = new HDRCubeTexture("resources/full_hdr_dark.hdr",scene,512);
    scene.clearColor = new Color4(0,0,0,1);
    scene.ambientColor = new Color3(0.3,0.3,0.3);
    scene.createDefaultSkybox(hdrTexture,true, 100000);
    scene.createDefaultEnvironment({
        environmentTexture: hdrTexture,
        skyboxColor: new Color3(0,0,0),
    })
    scene.gravity = new Vector3(0,-8,0);
    
    const camera= new UniversalCamera("Camera", new Vector3(0,100,-4000), scene);
    camera.maxZ=0;
    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    var pointlight: PointLight = new PointLight("pointlight", new Vector3(0,-30,0), scene);
    pointlight.intensity = 1000000;

    var thevoid = await SceneLoader.ImportMeshAsync("Circle", "resources/", "void.glb");
    thevoid.meshes[1].material = voidMaterial();
    thevoid.meshes[1].position.subtractInPlace(new Vector3(0,150,0));
    thevoid.meshes[1].checkCollisions = true;


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
    animations = await Animation.ParseFromFileAsync(null, "resources/animations.json") as Animation[];
    xr_cam.animations = animations;
    xr.baseExperience.sessionManager.onXRSessionInit.add(()=>{
        xr_cam.maxZ=100000;
        scene.activeCamera = xr_cam;
        reset();
    });

    scene.registerBeforeRender(()=>{
        update(scene);
    });
    scene.registerAfterRender(()=>{
    });
    
    UI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var rect1 = new Rectangle("fade");
    rect1.alpha = 0;
    rect1.background = "Black";
    UI.addControl(rect1);


    plane = MeshBuilder.CreatePlane("button_plane", {size:2}, scene);
    plane.position = camera.position.clone().addInPlaceFromFloats(0,0,2);
    buttons = AdvancedDynamicTexture.CreateForMesh(plane);
    var button = Button.CreateSimpleButton("enter", "Enter");
    button.width = 0.5;
    button.height = "40px";
    button.color = "white";
    button.background = "black";
    button.onPointerClickObservable.add(()=>{
        button.isVisible = false;
        const activeCam = scene.activeCamera;
        scene.beginAnimation(activeCam, 0,3045.3401489722814, false, 1,()=>{
            // fade out
            scene.stopAnimation(activeCam);
            if(scene.activeCamera == activeCam){
                fadeout = true;
            }
            
        });
    });
    buttons.addControl(button);

    // add sounds
    const background = new Sound("background", "resources/TheVoidBackground.mp3", scene, null, {
        loop: true,
        autoplay: true,
        spatialSound: true,
        maxDistance: 4000
      });
    background.setPosition(pointlight.position);

    const void_sound = new Sound("void", "resources/VOID.mp3", scene, null, {
        loop: true,
        autoplay: true,
        spatialSound: true,
        maxDistance: 4000,
        volume:0.7
      });
    void_sound.setPosition(new Vector3(0,-3750,0));
    
    reset();
    return scene;
}

// scene.deltaTime for frame delta
function update(scene: Scene): void{
    if(UI.getControlByName("fade").alpha>=1){
        reset();
    }
    if(fadeout){
        UI.getControlByName("fade").alpha += scene.deltaTime*0.0005;
    }
}

function reset(): void{
    // reset camera position
    fadeout = false;
    scene.activeCamera.position = new Vector3(0,100,-4000);
    scene.activeCamera.animations = animations;
    UI.getControlByName("fade").alpha = 0;
    plane.position = scene.activeCamera.position.clone().addInPlaceFromFloats(0,0,2);
    buttons.getControlByName("enter").isVisible = true;

}