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
    constructor(x, y, name, couleur, legende, valeur, unite) {
        this.ligne = ShapeFond(x, y);
        this.bouton = ShapeBouton(name + "_bouton", couleur, x+150, y);
        this.legende = Texte(name + "_legende", legende, x-230, y);
        this.texteValeur = Texte(name + "_valeur", valeur.toLocaleString('fr-FR', {maximumFractionDigits: 3}), x+320, y);
        this.unite = Texte(name + "_unite", unite, x+390, y);
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
        La légende a un nom et une valeur.
    */
    texte = new createjs.Text(valeur, "20px Quicksand", "#333");
    texte.x = x;
    texte.y = y;
    texte.name = name;
    texte.textBaseline = "middle"
    stageCurseurs.addChild(texte);
    return texte;
}

const xminCurseur = 250;    // position de l'extrémité gauche des curseurs
curseur1 = new Curseur(xminCurseur, 50, "curseur_constante_vitesse", 'red', "Constante de vitesse k", 0.002 + 0.5 * (0.02 - 0.002), "s⁻¹");
curseur2 = new Curseur(xminCurseur, 100, "curseur_concentration_initiale", 'red', "Concentration initiale", 0.2 + 0.5 * (1 - 0.2), "mol.L⁻¹");


// ===== Mise à jour des curseurs =====

function maj(bouton) {
    /*
        Cette fonction met à jour les graphes lorsqu'un curseur est déplacé.
    */
    let valeur = 0;
    
    switch (bouton.name) {
        case "curseur_constante_vitesse_bouton":
            valeur = (bouton.x - xminCurseur) / 300. * 0.018 + 0.002;
            constante_vitesse = valeur;
            stageCurseurs.getChildByName("curseur_constante_vitesse_valeur").text = valeur.toLocaleString('fr-FR', {maximumFractionDigits: 4});
            break;
        case "curseur_concentration_initiale_bouton":
            valeur = (bouton.x - xminCurseur) / 300. * 0.8 + 0.2;
            concentration_initiale = valeur;
            stageCurseurs.getChildByName("curseur_concentration_initiale_valeur").text = valeur.toLocaleString('fr-FR', {maximumFractionDigits: 2});
            break;
    }
    
    traceCourbe();
    tracePointeur();
}

function onMouseDown(event) {
    /*
        Cette fonction calcule le décalage entre l'objet
        et la position de l'évènement lors d'un clic.
    */
    object = event.currentTarget;
    object.offsetX = object.x - event.stageX;
}

function onPressMove(event) {
    /*
        Cette fonction met à jour le curseur et
        les graphes lors du déplacement d'un bouton.
    */
    bouton = event.currentTarget;
    bouton.x = Math.min(Math.max(xminCurseur, event.stageX + bouton.offsetX), xminCurseur+300);
    maj(bouton);
    stageCurseurs.update();
    stageGraphe.update();
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

canvasGraphe = document.getElementById("canvasGraphe");
stageGraphe = new createjs.Stage(canvasGraphe);

// ===== Tracé de la courbe =====

// Limites du graphe
const xmax = 550;

graphe = new createjs.Container();
stageGraphe.addChild(graphe);
graphe.x = 100;
graphe.y = 300;

// Tracé des axes
axes = new createjs.Shape();
graphe.addChild(axes);
axes.graphics.ss(3, 1, 1).s('#000').mt(0, 0).lt(xmax, 0).mt(xmax-10, -10).lt(xmax, 0).lt(xmax-10, 10);      // axe horizontal
axes.graphics.ss(3, 1, 1).s('#000').mt(0, 0).lt(0, -240).mt(-10, -230).lt(0, -240).lt(10, -230);            // axe vertical

// Légende de l'axe des abscisses
xlegend = new createjs.Text("temps", "20px Quicksand", 'black');
xlegend.x = xmax + 60;
xlegend.y = 320;
xlegend.name = "xlegend";
xlegend.textBaseLine = "middle";
stageGraphe.addChild(xlegend);

// Légende de l'axe des ordonnées
ylegend = new createjs.Text("concentration", "20px Quicksand", 'black');
ylegend.x = 50;
ylegend.y = 25;
ylegend.name = "ylegend";
stageGraphe.addChild(ylegend);

// Tracé de la courbe
courbe = new createjs.Shape();
graphe.addChild(courbe);

function traceCourbe() {
    /*
        Cette fonction trace la courbe représentant la concentration
        du réactif en fonction du temps.
    */
    courbe.graphics.clear();
    
    let amplitude = concentration_initiale * facteur_concentration;
    courbe.graphics.ss(3).s('red').mt(0, -amplitude);
    
    switch (ordre) {
        case 0:
            for (i = 1; i < xmax; i++) {
                y = facteur_concentration * (concentration_initiale - constante_vitesse * i);
                courbe.graphics.lt(i, -y);
                if (y < 0) { break; }
            }
            break;
        case 1:
            for (i = 1; i < xmax; i++) {
                courbe.graphics.lt(i, -amplitude * Math.exp(-constante_vitesse * i));
            }
            break;
        case 2:
            for (i = 1; i < xmax; i++) {
                courbe.graphics.lt(i, -facteur_concentration * concentration_initiale / (1 + 2 * concentration_initiale * constante_vitesse * i));
            }
            break;
    }
    
    courbe.graphics.es();
}


// ===== Tracé du pointeur =====

pointeur = new createjs.Shape();
graphe.addChild(pointeur);

pointeurXLabel = new createjs.Text("t", "20px Quicksand", 'green');
graphe.addChild(pointeurXLabel);

pointeurXLabel2 = new createjs.Text("1/2", "12px Quicksand", 'green');
graphe.addChild(pointeurXLabel2);

pointeurYLabel = new createjs.Text("C₀/2", "20px Quicksand", 'green');
graphe.addChild(pointeurYLabel);

function tempsDemiReaction() {
    /*
        Cette fonction renvoie la valeur du temps de demi-réaction,
        calculée en fonction de l'ordre de réaction.
    */
    switch (ordre) {
        case 0:
            return concentration_initiale / (2 * constante_vitesse);
        case 1:
            return Math.log(2) / constante_vitesse;
        case 2:
            return 1. / (2 * constante_vitesse * concentration_initiale);
    }
}

function tracePointeur() {
    /*
        Cette fonction trace deux droites sur le graphique permettant
        de repérer le point de la courbe correspond à la demi-réaction.
    */
    
    // calcul des coordonnées
    temps_demi_reaction = tempsDemiReaction();
    x = temps_demi_reaction;
    y = -concentration_initiale * facteur_concentration * 0.5;
    
    // tracé des deux droites
    pointeur.graphics.clear();
    pointeur.graphics.setStrokeDash([5,6]).s('green').mt(x, 0).lt(x, y).lt(0, y);
    
    // pointeur t1/2
    pointeurXLabel.x = x-4;
    pointeurXLabel.y = 5;
    pointeurXLabel2.x = x+3;
    pointeurXLabel2.y = 15;
    
    // pointeur C0/2
    pointeurYLabel.x = -50;
    pointeurYLabel.y = y-10;
}



//==============================
//       Section ordre
//==============================

function majUnite() {
    /*
        Cette fonction met à jour l'unité de la constante
        de vitesse, en fonction de l'ordre de réaction.
    */
    switch (ordre) {
        case 0:
            curseur1.unite.text = "mol.L⁻¹.s⁻¹";
            break;
        case 1:
            curseur1.unite.text = "s⁻¹";
            break;
        case 2:
            curseur1.unite.text = "L.mol⁻¹.s⁻¹";
            break;
    }
}

const lois_vitesse = [
    document.getElementById("loi_vitesse0"),
    document.getElementById("loi_vitesse1"),
    document.getElementById("loi_vitesse2"),
];

const lois_concentration = [
    document.getElementById("loi_concentration0"),
    document.getElementById("loi_concentration1"),
    document.getElementById("loi_concentration2"),
]

const inputs = document.querySelectorAll("input");

for (input of inputs) {
    /*
        Ajout d'écouteurs pour les radio buttons
        permettant de choisir l'ordre de réaction.
    */
    input.addEventListener("change", function(event) {
        if (this.checked) {
            ordre = parseInt(this.value);
                        
            for (let i = 0; i < 3; i++) {
                if (i == ordre) {
                    // rend visible les textes pour l'ordre sélectionné
                    lois_vitesse[i].setAttribute("class", "visible");
                    lois_concentration[i].setAttribute("class", "loi_concentration visible");
                } else {
                    // rend invisible les textes pour les autres ordres
                    lois_vitesse[i].setAttribute("class", "hidden");
                    lois_concentration[i].setAttribute("class", "loi_concentration hidden");
                }
            }
        }
        
        majUnite();
        traceCourbe();
        tracePointeur();
        stageCurseurs.update();
        stageGraphe.update();
    });
}



// ===== Initialisation =====

let ordre = 1;
let constante_vitesse = 0.002 + 0.5 * (0.02 - 0.002);
let temps_demi_reaction = Math.log(2) / constante_vitesse;
let concentration_initiale = 0.2 + 0.5 * (1 - 0.2);

const facteur_concentration = 220;          // facteur multiplicatif pour tracer le graphe
traceCourbe();
tracePointeur();

stageCurseurs.update();
stageGraphe.update();