canvas = document.getElementById("canvas");
stage = new createjs.Stage(canvas);
stage.enableMouseOver();
createjs.Touch.enable(stage);
stage.mouseMoveOutside = true;

//======================================
//       Diagramme énergétique
//======================================

// Limites du graphe
const xmax = 500;

// Échelle d'énergie
const facteur = 130;

energies = [
    -0.38,
    -0.54,
    -0.85,
    -1.51,
    -3.40,
];

graphe = new createjs.Container();
stage.addChild(graphe);
graphe.x = 100;
graphe.y = 30;

diagramme = new createjs.Shape();
graphe.addChild(diagramme);

diagramme.graphics.ss(3, 1, 1).s('black').mt(0, -facteur*0.2).lt(0, facteur*3.6).mt(-10, -facteur*0.2+10).lt(0, -facteur*0.2).lt(10, -facteur*0.2+10);
diagramme.graphics.ss(3, 1, 1).s('black').mt(-10, 0).lt(xmax, 0);

let n = 6;
for (energie of energies) {
    y = -facteur * energie;
    diagramme.graphics.ss(3, 1, 1).s('black').mt(-10, y).lt(xmax, y);
    
    valeurEnergie = new createjs.Text(energie.toLocaleString('fr-FR', {maximumFractionDigits: 2}), "20px Quicksand", 'black');
    valeurEnergie.x = -70;
    valeurEnergie.y = y-10;
    valeurEnergie.textBaseLine = "middle";    
    graphe.addChild(valeurEnergie);
    
    niveauEnergie = new createjs.Text("n = " + n, "20px Quicksand", 'black');
    niveauEnergie.x = graphe.x + xmax - 80;
    niveauEnergie.y = y-10;
    niveauEnergie.textBaseLine = "middle";
    graphe.addChild(niveauEnergie);
    
    n -= 1;
}



//======================================
//       Création des transitions
//======================================

class Transition {
    constructor(x, y, E_initiale, E_finale, numero, positionPhoton, color=red) {
        this.x = x;
        this.y = y;
        this.E_initiale = E_initiale;
        this.E_finale = E_finale;
        
        // Création de la flèche
        this.shape = shapeTransition(x, y, Math.abs(E_initiale - E_finale), numero, positionPhoton, color, E_initiale < E_finale);
        
        this.deltaE = new createjs.Text("ΔE = " + Math.abs(E_initiale - E_finale).toLocaleString('fr-FR', {maximumFractionDigits: 2}) + " eV", "20px Quicksand", color);
        this.deltaE.x = x + 220;
        this.deltaE.y = y - positionPhoton * Math.abs(E_initiale - E_finale) * facteur - 10;
        this.deltaE.name = "texte" + numero;
        stage.addChild(this.deltaE);
    }
}

function shapeTransition(x, y, deltaE, numero, positionPhoton, color='red', isUp=false) {
    shape = new createjs.Shape();
    stage.addChild(shape);
    
    longueur = deltaE * facteur;
    frequence = deltaE / 3.02;
    
    // tracé de la flèche
    shape.graphics.ss(3, 1, 1).s(color).mt(0, 0).lt(0, -longueur);
    switch (isUp) {
        case true:
            // tracé de la flèche
            shape.graphics.ss(3, 1, 1).s(color).mt(-10, -longueur+10).lt(0, -longueur).lt(10, -longueur+10);
            
            // tracé du photon
            break;
        case false:
            // tracé de la flèche
            shape.graphics.ss(3, 1, 1).s(color).mt(-10, -10).lt(0, 0).lt(10, -10);
            
            // tracé du photon
            yPhoton = -positionPhoton * longueur;
            shape.graphics.ss(3, 1, 1).s(color).mt(20, yPhoton + 6 * Math.sin(frequence * (20-175)/5));
            for (let i = 21; i < 176; i++) {
                shape.graphics.lt(i, yPhoton + 6 * Math.sin(frequence * (i-175)/5));
            }
            shape.graphics.lt(185, yPhoton);
            shape.graphics.mt(185, yPhoton+8).lt(200, yPhoton).lt(185, yPhoton-8).lt(185, yPhoton+8);
            break;
    }
    
    shape.x = x;
    shape.y = y;
    
    shape.name = "shape" + numero;
    shape.cursor = 'pointer';
    
    return shape;
}

function onMouseDown(event) {
    object = event.currentTarget;
    object.offsetX = object.x - event.stageX;
    object.offsetY = object.y - event.stageY;
}

function onPressMove(event) {
    /*
    Cette fonction met à jour le curseur et les graphes lors du déplacement d'un bouton.
    */
    object = event.currentTarget;
    object.x = Math.min(Math.max(graphe.x, event.stageX + object.offsetX), 950);
    object.y = Math.min(Math.max(0, event.stageY + object.offsetY), 750);
    stage.update();
}

function onPressUp(event) {
    object = event.currentTarget;
    numero = object.name.substr(5, 1);

    if (Math.abs(object.y - (facteur*3.4 + graphe.y)) < 10 && object.x > graphe.x && object.x < graphe.x + xmax) {
        object.y = facteur * 3.4 + graphe.y;
        stage.update();
        
        transitionsChecked[numero] = true;
    } else {
        transitionsChecked[numero] = false;
    }
}

transition1 = new Transition(750, 475, energies[0], energies[4], 0, 0.975, 'purple');
transition1.shape.addEventListener("mousedown", onMouseDown);
transition1.shape.addEventListener("pressmove", onPressMove);
transition1.shape.addEventListener("pressup", onPressUp);

transition1 = new Transition(800, 475, energies[1], energies[4], 1, 0.94, 'blue');
transition1.shape.addEventListener("mousedown", onMouseDown);
transition1.shape.addEventListener("pressmove", onPressMove);
transition1.shape.addEventListener("pressup", onPressUp);

transition3 = new Transition(850, 475, energies[2], energies[4], 2, 0.85, 'green');
transition3.shape.addEventListener("mousedown", onMouseDown);
transition3.shape.addEventListener("pressmove", onPressMove);
transition3.shape.addEventListener("pressup", onPressUp);

transition4 = new Transition(900, 475, energies[3], energies[4], 3, 0.85, 'red');
transition4.shape.addEventListener("mousedown", onMouseDown);
transition4.shape.addEventListener("pressmove", onPressMove);
transition4.shape.addEventListener("pressup", onPressUp);

transitionsChecked = [
    false,
    false,
    false,
    false,
]

canvas.addEventListener("mouseup", function(event) {
    console.log("Oui");
    for (checked of transitionsChecked) {
        console.log(checked);
        if (!checked) {
            return;
        }
    }
    alert("C'est bon!");
});



stage.update();