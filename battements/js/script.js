//==============================
//       Canvas curseurs
//==============================

canvasCurseurs = document.getElementById("canvasCurseurs");
stageCurseurs = new createjs.Stage(canvasCurseurs);
stageCurseurs.enableMouseOver();
createjs.Touch.enable(stageCurseurs);
stageCurseurs.mouseMoveOutside = true;


// ===== Fonctions de création des curseurs =====

class Curseur {
    /*
        Classe définissant des curseurs, auxquels sont associés une
        ligne, un bouton, une légende, une valeur affichée et l'unité
        de la grandeur.
    */
    constructor(x, y, name, couleur, legende) {
        this.ligne = ShapeFond(x, y);
        this.bouton = ShapeBouton(name + "_bouton", couleur, x+150, y);
        this.legende = Texte(name + "_legende", legende, x-90, y);
        this.texteValeur = Texte(name + "_valeur", "440", x+320, y);
        this.unite = Texte(name + "_unite", "Hz", x+360, y);
    }
}

function ShapeFond(x, y) {
    /*
    Cette fonction trace une barre horizontale de longueur 300 px.
    La barre est tracée à la position (x, y).
    */
    fond = new createjs.Shape();
    stageCurseurs.addChild(fond);
    fond.graphics.ss(4, 1, 1).s('#333').mt(0, 0).lt(300, 0);
    fond.x = x;
    fond.y = y;
    return fond;
}

function ShapeBouton(name, couleur, x, y) {
    /*
    Cette fonction trace un bouton à la position (x ,y).
    Le bouton a un nom et une couleur.
    */
    btn = new createjs.Shape();
    stageCurseurs.addChild(btn)
    btn.cursor = 'pointer';
    btn.graphics.f(couleur).dc(0, 0, 10).ef().es();
    btn.name = name;
    btn.shadow = new createjs.Shadow("#000", 4, 4, 5);
    btn.x = x;
    btn.y = y;
    return btn
}

function Texte(name, valeur, x, y) {
    /*
    Cette fonction crée une légende pour indiquer, à la position (x, y), la valeur du curseur.
    La légende a un nombre et une valeur.
    */
    texte = new createjs.Text(valeur, "20px Asul", "#333");
    texte.x = x;
    texte.y = y;
    texte.name = name;
    texte.textBaseline = "middle"
    stageCurseurs.addChild(texte);
    return texte;
}

// Création des curseurs
const xminCurseur = 130;    // position de l'extrémité gauche des curseurs
curseur1 = new Curseur(xminCurseur, 70, "curseur1", 'red', "Signal 1");
curseur2 = new Curseur(xminCurseur, 200, "curseur2", 'blue', "Signal 2");


// ===== Mise à jour des curseurs =====

function maj(bouton) {
    /*
    Cette fonction met à jour les graphes lorsqu'un curseur est déplacé.
    */
    valeur = (bouton.x - xminCurseur) / 300. * 400 + 240;   // renvoie une valeur comprise entre 240 et 640
    numero = bouton.name.substr(7, 1);                      // renvoie le numéro du curseur
    stageCurseurs.getChildByName("curseur" + numero + "_valeur").text = valeur.toLocaleString('fr-FR', {maximumFractionDigits: 0});
    // écriture de la valeur sans décimale
    
    switch (numero) {
        case "1": 
            frequence1 = valeur;
            traceSignal(signal1, frequence1, 'red');
            break;
        case "2":
            frequence2 = valeur;
            traceSignal(signal2, frequence2, 'blue');
            break;
    }
    traceSomme();
}

function onMouseDown(event) {
    object = event.currentTarget;
    object.offsetX = object.x - event.stageX;
    console.log(object);
    console.log(object.x);
    console.log(event.stageX);
    console.log(object.offsetX);
}

function onPressMove(event) {
    /*
    Cette fonction met à jour le curseur et les graphes lors du déplacement d'un bouton.
    */
    bouton = event.currentTarget;
    bouton.x = Math.min(Math.max(xminCurseur, event.stageX + bouton.offsetX), xminCurseur+300);
    maj(bouton);
    stageCurseurs.update();
    stageGraphes.update();
}

// actions lors d'une modification du curseur 1
curseur1.bouton.addEventListener("mousedown", onMouseDown);
curseur1.bouton.addEventListener("pressmove", onPressMove);

// actions lors d'une modification du curseur 2
curseur2.bouton.addEventListener("mousedown", onMouseDown);
curseur2.bouton.addEventListener("pressmove", onPressMove);



//==============================
//       Canvas graphiques
//==============================

canvasGraphes = document.getElementById("canvasGraphes");
stageGraphes = new createjs.Stage(canvasGraphes);

function xlegend(y, name) {
    legend = new createjs.Text("temps", "20px Asul", "#333");
    legend.x = xmax + 60;
    legend.y = y;
    legend.name = name;
    legend.textBaseline = "middle"
    stageGraphes.addChild(legend);
}

// Limites du graphe
const xmax = 500;

// ===== Premier signal =====
graphe1 = new createjs.Container();
stageGraphes.addChild(graphe1);
graphe1.x = 50;
graphe1.y = 70;

axes = new createjs.Shape();
graphe1.addChild(axes);
axes.graphics.ss(3, 1, 1).s('#000').mt(-10, 0).lt(xmax, 0).mt(xmax-10, -10).lt(xmax, 0).lt(xmax-10, 10);    // axe horizontal
axes.graphics.ss(3, 1, 1).s('#000').mt(0, -60).lt(0, 60).mt(-10, -50).lt(0, -60).lt(10, -50);               // axe vertical

xlegend(70, "xlegend1");

signal1 = new createjs.Shape();
graphe1.addChild(signal1);

// ===== Second signal =====
graphe2 = new createjs.Container();
stageGraphes.addChild(graphe2);
graphe2.x = 50;
graphe2.y = 200;

axes = new createjs.Shape();
graphe2.addChild(axes);
axes.graphics.ss(3, 1, 1).s('#000').mt(-10, 0).lt(xmax, 0).mt(xmax-10, -10).lt(xmax, 0).lt(xmax-10, 10);    // axe horizontal
axes.graphics.ss(3, 1, 1).s('#000').mt(0, -60).lt(0, 60).mt(-10, -50).lt(0, -60).lt(10, -50);               // axe vertical

xlegend(200, "xlegend2");

signal2 = new createjs.Shape();
graphe2.addChild(signal2);

// ===== Somme des signaux =====
grapheSomme = new createjs.Container();
stageGraphes.addChild(grapheSomme);
grapheSomme.x = 50;
grapheSomme.y = 390;

axes = new createjs.Shape();
grapheSomme.addChild(axes);
axes.graphics.ss(3, 1, 1).s('#000').mt(-10, 0).lt(xmax, 0).mt(xmax-10, -10).lt(xmax, 0).lt(xmax-10, 10);    // axe horizontal
axes.graphics.ss(3, 1, 1).s('#000').mt(0, -120).lt(0, 120).mt(-10, -110).lt(0, -120).lt(10, -110);          // axe vertical

xlegend(390, "xlegend_somme");


// somme des signaux 1 et 2
somme = new createjs.Shape();
grapheSomme.addChild(somme);

// enveloppes de la somme des signaux 1 et 2
enveloppe1 = new createjs.Shape();
grapheSomme.addChild(enveloppe1);

enveloppe2 = new createjs.Shape();
grapheSomme.addChild(enveloppe2);

const amplitude = 40;

function traceSignal(signal, frequence, couleur) {
    /*
        Cette fonction trace une fonction sinus de fréquence donnée,
        à la couleur indiquée.
        Elle prend en argument l'un des deux signaux harmoniques.
    */
    signal.graphics.clear();
    signal.graphics.ss(3).s(couleur).mt(0, amplitude * Math.sin(2 * Math.PI * frequence * 0 / xmax * 0.020));
    for (i = 1; i < xmax; i++) {
        signal.graphics.lt(i, amplitude * Math.sin(2 * Math.PI * frequence * i / xmax * 0.020));
    }
    signal.graphics.es();
}

function traceSomme() {
    /*
        Cette fonction trace la somme des deux signaux harmoniques,
        ainsi que l'enveloppe des battements.
    */
    somme.graphics.clear();
    enveloppe1.graphics.clear();
    enveloppe2.graphics.clear();
        
    somme.graphics.ss(3).s('purple').mt(
        0,
        amplitude * Math.sin(2 * Math.PI * frequence1 * 0 / (2 * xmax) * 0.050)
        + amplitude * Math.sin(2 * Math.PI * frequence2 * 0 / (2 * xmax) * 0.050)
    );
    for (i = 1; i < xmax; i++) {
        somme.graphics.lt(
            i,
            amplitude * Math.sin(2 * Math.PI * frequence1 * i / (2 * xmax) * 0.050)
            + amplitude * Math.sin(2 * Math.PI * frequence2 * i / (2 * xmax) * 0.050)
        );
    }
    
    enveloppe1.graphics.ss(1).s('green').mt(0, 2 * amplitude * Math.cos(Math.PI * (frequence1 - frequence2) * 0 / (2 * xmax) * 0.050));
    for (i = 1; i < xmax; i++) {
        enveloppe1.graphics.lt(i, 2 * amplitude * Math.cos(Math.PI * (frequence1 - frequence2) * i / (2 * xmax) * 0.050));
    }
    
    enveloppe2.graphics.ss(1).s('green').mt(0, -2 * amplitude * Math.cos(Math.PI * (frequence1 - frequence2) * 0 / (2 * xmax) * 0.050));
    for (i = 1; i < xmax; i++) {
        enveloppe2.graphics.lt(i, -2 * amplitude * Math.cos(Math.PI * (frequence1 - frequence2) * i / (2 * xmax) * 0.050));
    }
}



// ===== Initialisation =====

frequence1 = 440;
traceSignal(signal1, frequence1, 'red');
frequence2 = 440;
traceSignal(signal2, frequence2, 'blue');
traceSomme();

stageCurseurs.update();
stageGraphes.update();