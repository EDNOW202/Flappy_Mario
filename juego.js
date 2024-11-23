const pantalla = document.getElementById("canvas");
const contexto = pantalla.getContext("2d");

pantalla.tabIndex = 1;

pantalla.addEventListener("click", () => {
    switch (estado.actual) {
        case estado.listo:
            estado.actual = estado.jugando;
            break;
        case estado.jugando:
            mario.saltar();
            break;
        case estado.finJuego:
            estado.actual = estado.listo;
            mario.y = 100;
            mario.velocidad = 0;
            tubos.listaTubos = [];
            interfaz.puntajeActual = 0;
            break;
    }
});

let cuadros = 0;
let velocidad = 2;

const estado = {
    actual: 0,
    listo: 0,
    jugando: 1,
    finJuego: 2,
};

const fondo = {
    sprite: new Image(),
    fondoSecundario: new Image(),
    x: 0,
    xSecundario: 0,
    alturaVisible: 250,
    dibujar: function () {
        contexto.drawImage(this.fondoSecundario, this.xSecundario, 0, pantalla.width, pantalla.height);
        contexto.drawImage(this.fondoSecundario, this.xSecundario + pantalla.width, 0, pantalla.width, pantalla.height);
        const yFondoPrincipal = pantalla.height / 2 - this.alturaVisible / 2 + 100;
        contexto.drawImage(this.sprite, this.x, yFondoPrincipal, pantalla.width, this.alturaVisible);
        contexto.drawImage(this.sprite, this.x + pantalla.width, yFondoPrincipal, pantalla.width, this.alturaVisible);
    },
    actualizar: function () {
        if (this.x <= -pantalla.width) {
            this.x = 0;
        }
        if (this.xSecundario <= -pantalla.width) {
            this.xSecundario = 0;
        }
    },
};

fondo.sprite.src = "png/fondo.png";
fondo.fondoSecundario.src = "png/fondo2.png";

const gnd = {
    sprite: new Image(),
    x: 0,
    y: 0,
    velocidad: 2,
    dibujar: function () {
        this.y = parseFloat(pantalla.height - this.sprite.height);
        contexto.drawImage(this.sprite, this.x, this.y, pantalla.width, this.sprite.height);
        contexto.drawImage(this.sprite, this.x + pantalla.width, this.y, pantalla.width, this.sprite.height);
    },
    actualizar: function () {
        if (estado.actual !== estado.jugando) return;
        this.x -= this.velocidad;
        if (this.x <= -pantalla.width) {
            this.x = 0;
        }
    },
};

const mario = {
    animaciones: [
        { sprite: new Image() },
        { sprite: new Image() },
        { sprite: new Image() },
    ],
    x: 50,
    y: 100,
    velocidad: 0,
    gravedad: 0.15,
    impulso: 3,
    cuadroActual: 0,
    ancho: 50,
    alto: 50,
    dibujar: function () {
        let sprite = this.animaciones[this.cuadroActual].sprite;
        contexto.drawImage(sprite, this.x, this.y, this.ancho, this.alto);
    },
    actualizar: function () {
        if (estado.actual === estado.jugando) {
            this.y += this.velocidad;
            this.velocidad += this.gravedad;
            if (
                this.y + this.alto >= pantalla.height - gnd.sprite.height ||
                tubos.colision()
            ) {
                estado.actual = estado.finJuego;
            }
            if (cuadros % 10 === 0) {
                this.cuadroActual = (this.cuadroActual + 1) % this.animaciones.length;
            }
        }
    },
    saltar: function () {
        this.velocidad = -this.impulso;
    },
};

const tubos = {
    top: { sprite: new Image() },
    bot: { sprite: new Image() },
    listaTubos: [],
    gap: 120,
    moved: true,
    dibujar: function () {
        for (let i = 0; i < this.listaTubos.length; i++) {
            let tubo = this.listaTubos[i];
            contexto.drawImage(this.top.sprite, tubo.x, tubo.y);
            contexto.drawImage(
                this.bot.sprite,
                tubo.x,
                tubo.y + parseFloat(this.top.sprite.height) + this.gap
            );
        }
    },
    actualizar: function () {
        if (estado.actual !== estado.jugando) return;
        if (cuadros % 100 === 0) {
            this.listaTubos.push({
                x: pantalla.width,
                y: -210 * Math.min(Math.random() + 1, 1.8),
            });
        }
        this.listaTubos.forEach((tubo) => {
            tubo.x -= velocidad;
        });
        if (this.listaTubos.length && this.listaTubos[0].x < -this.top.sprite.width) {
            this.listaTubos.shift();
            this.moved = true;
        }
    },
    colision: function () {
        for (let i = 0; i < this.listaTubos.length; i++) {
            let tubo = this.listaTubos[i];
            if (
                mario.x + mario.ancho > tubo.x &&
                mario.x < tubo.x + this.top.sprite.width &&
                mario.y < tubo.y + this.top.sprite.height
            ) {
                return true;
            }
            if (
                mario.x + mario.ancho > tubo.x &&
                mario.x < tubo.x + this.bot.sprite.width &&
                mario.y + mario.alto >
                    tubo.y + this.top.sprite.height + this.gap
            ) {
                return true;
            }
        }
        return false;
    },
};

const interfaz = {
    puntajeActual: 0,
    dibujar: function () {
        contexto.fillStyle = "#FFF";
        contexto.font = "35px Arial";
        contexto.fillText(this.puntajeActual, pantalla.width / 2, 50);
    },
};

fondo.sprite.src = "png/fondo.png";
gnd.sprite.src = "png/tierra.png";
tubos.top.sprite.src = "png/tuboarriba.png";
tubos.bot.sprite.src = "png/tuboabajo.png";
mario.animaciones[0].sprite.src = "png/1.png";
mario.animaciones[1].sprite.src = "png/2.png";
mario.animaciones[2].sprite.src = "png/3.png";

function bucleJuego() {
    actualizar();
    dibujar();
    cuadros++;
    requestAnimationFrame(bucleJuego);
}

function actualizar() {
    fondo.actualizar();
    gnd.actualizar();
    mario.actualizar();
    tubos.actualizar();
    if (estado.actual === estado.jugando && cuadros % 90 === 0) {
        interfaz.puntajeActual++;
    }
}

function dibujar() {
    fondo.dibujar();
    tubos.dibujar();
    gnd.dibujar();
    mario.dibujar();
    interfaz.dibujar();
}

bucleJuego();
