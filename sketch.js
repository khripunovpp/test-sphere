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

        // this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 1000);

        var frustumSize = 3;
        var aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -1000, 1000);
        this.camera.position.set(0, 0, 3);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;
        this.isPlaying = true;

        this.cords = {
            mazunte: ['15.6677N', '96.5545W'],
            lax: ['33.9416N', '118.4085W'],
            moscow: ['55.7558N', '37.6173E'],
            buenosAires: ['34.6037S', '58.3816W'],
            northPole: ['90N', '0'],
            southPole: ['90S', '0'],
            zeroZero: ['0', '0'],
        };
        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
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
        this.addPin('northPole', this.cords.northPole, 0x0000ff);

        this.addPin('southPole', this.cords.southPole);
        this.addPin('zeroZero', this.cords.zeroZero);

        // this.addPin('mazunte', this.cords.mazunte);
        // this.addPin('lax', this.cords.lax, 0x00ff00);
        // this.addPin('moscow', this.cords.moscow, 0x0000ff);
        // this.addPin('buenosAires', this.cords.buenosAires, 0xffff00);
    }

    addPin(name, coordinates, color = 0xff0000) {

        // Преобразование географических координат в сферические координаты
        const latitude = this.parseLatitude(coordinates[0]);
        const longitude = this.parseLongitude(coordinates[1]);
        const phi = (90 - latitude) * Math.PI / 180;
        const theta = (longitude + 180) * Math.PI / 180;

        // Вычисление трехмерных координат на сфере
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        console.log({
            name,
            coordinates,
            latitude,
            longitude,
            phi,
            theta,
            x,
            y,
            z,
        })

        // Создание геометрии для точки (например, сферы)
        const geometry = new THREE.SphereGeometry(0.05, 32, 32);

        // Создание материала точки (например, основанного на цвете)
        const material = new THREE.MeshBasicMaterial({color});

        // Создание объекта точки и установка его позиции
        const pin = new THREE.Mesh(geometry, material);
        pin.position.set(x, y, z);

        // Добавление точки на сферу
        this.scene.add(pin);
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

    getPolus(cord) {
        const lastSymbol = cord[cord.length - 1];
        return {
            north: lastSymbol === 'N',
            south: lastSymbol === 'S',
            west: lastSymbol === 'W',
            east: lastSymbol === 'E',
        }
    }

    adddPin(
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

    getRadianAngle(deg) {
        const parsed = parseFloat(deg);
        console.log({
            parsed
        })
        return parseFloat(deg) * (Math.PI / 180);
    }

    getCords(
        lat,
        lng
    ) {
        const polusLat = this.getPolus(lat);
        const polusLng = this.getPolus(lng);
        let latRad = this.getRadianAngle(lat);
        let lngRad = this.getRadianAngle(lng);


        console.log({
            lat,
            latRad,
            lng,
            lngRad
        })
        console.log({
            polusLat,
            polusLng
        })

        let x = Math.cos(lngRad) * Math.sin(latRad);
        let y = Math.sin(lngRad) * Math.sin(latRad);
        let z = Math.cos(latRad);

        if (polusLat.south) {
            y = -y;
        }
        if (polusLng.east) {
            x = -x;
            z = -z;
        }

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