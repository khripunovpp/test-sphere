import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
// // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//
import * as dat from "dat.gui";
import earth from "./pics/earth-texture.jpg"

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();
        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0xeeeeee, 1);
        this.container.appendChild(this.renderer.domElement);
        this.setCamera('orthographic');
        this.time = 0;
        this.isPlaying = true;

        this.cords = {
            mazunte: ['15.6677N', '96.5545W'],
            lax: ['33.9416N', '118.4085W'],
            moscow: ['55.7558N', '37.6173E'],
            buenosAires: ['34.6037S', '58.3816W'],
            lisbon: ['38.7223N', '9.1393W'],
            northPole: ['90N', '0'],
            southPole: ['90S', '0'],
            zeroZero: ['0', '0'],
        };
        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
    }

    setCamera(
        type = "perspective",
    ) {
        if (type === "perspective") {
            this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 1000);
        } else if (type === "orthographic") {
            const frustumSize = 3;
            const aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -1000, 1000);
        }
        this.camera.position.set(0, 0, 3);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    settingsGUI() {
        let that = this;

        this.settingsDefault = {
            progress: 0.3,
        };

        this.gui = new dat.GUI();
        this.gui.add(this.settingsDefault, "progress", 0, 1, 0.01);
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        this.material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(earth)
        })

        this.geometry = new THREE.SphereGeometry(1, 50, 50);

        this.plane = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.plane);

        this.scene.add(new THREE.AxesHelper(5));

        this.addPin('northPole', this.cords.northPole, 0x0000ff);
        this.addPin('southPole', this.cords.southPole);
        this.addPin('zeroZero', this.cords.zeroZero);
        this.addPin('mazunte', this.cords.mazunte);
        this.addPin('lax', this.cords.lax, 0x00ff00);
        this.addPin('moscow', this.cords.moscow, 0x0000ff);
        this.addPin('buenosAires', this.cords.buenosAires, 0xffff00);
        this.addPin('lisbon', this.cords.lisbon, 0xff0000);
    }

    parseLatitude(latitude) {
        const [degrees, direction] = latitude.split(/([0-9.]+)/).filter(Boolean);
        const value = parseFloat(degrees);
        return direction?.toUpperCase() === 'S' ? -value : value;
    }

    parseLongitude(longitude) {
        const [degrees, direction] = longitude.split(/([0-9.]+)/).filter(Boolean);
        const value = parseFloat(degrees);
        return direction?.toUpperCase() === 'W' ? -value : value;
    }

    addPin(
        name,
        pin,
        color = 0xff0000,
    ) {
        let mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 20, 20),
            new THREE.MeshBasicMaterial({
                color,
            }));
        const {
            x, y, z
        } = this.getCords(
            pin[0],
            pin[1]
        );

        console.log(name, {
            x, y, z
        })
        mesh.position.set(x, y, z);
        this.scene.add(mesh);
    }

    getCords(
        lat,
        lng
    ) {
        const latitude = this.parseLatitude(lat);
        const longitude = this.parseLongitude(lng);
        const phi = (90 - latitude) * Math.PI / 180;
        const theta = (longitude + 180) * Math.PI / 180;

        // если показано западное полушарие, то ставим минус
        const x = -Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        return {
            x, y, z
        }
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.render();
            this.isPlaying = true;
        }
    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.05;

        // this.material.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}