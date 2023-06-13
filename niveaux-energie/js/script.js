canvas = document.getElementById("canvas");
stage = new createjs.Stage(canvas);
stage.enableMouseOver();
createjs.Touch.enable(stage);
stage.mouseMoveOutside = true;

//======================================
//       Diagramme énergétique
//======================================

// limites du graphe
const xmax = 500;

// échelle d'énergie
const facteur = 130;

// niveaux d'énergie
energies = [
    -0.38,
    -0.54,
    -0.85,
    -1.51,
    -3.39,
];

// création d'un container graphique
graphe = new createjs.Container();
stage.addChild(graphe);
graphe.x = 100;
graphe.y = 30;

// création d'une shape pour le diagramme énergétique
diagramme = new createjs.Shape();
graphe.addChild(diagramme);

// tracé de l'axe vertical
diagramme.graphics.ss(3, 1, 1).s('black').mt(0, -facteur*0.2).lt(0, facteur*3.6);
diagramme.graphics.mt(-10, -facteur*0.2+10).lt(0, -facteur*0.2).lt(10, -facteur*0.2+10);

// tracé de l'état ionisé
diagramme.graphics.mt(-10, 0).lt(xmax, 0);

// valeur de l'énergie de l'état ionisé
valeurEnergie = new createjs.Text("0,00", "20px Quicksand", 'black');
valeurEnergie.x = -63;
valeurEnergie.y = -10;
valeurEnergie.textBaseLine = "middle";
graphe.addChild(valeurEnergie);

// tracé des niveaux d'énergie
let n = 6;
for (energie of energies) {
    y = -facteur * energie;
    diagramme.graphics.mt(-10, y).lt(xmax, y);
    
    // Valeur de l'énergie, écrite à gauche du diagramme
    let valeurEnergie = new createjs.Text(energie.toLocaleString('fr-FR', {maximumFractionDigits: 2}), "20px Quicksand", 'black');
    valeurEnergie.x = -70;
    valeurEnergie.y = y-10;
    valeurEnergie.textBaseLine = "middle";    
    graphe.addChild(valeurEnergie);
    
    // Numéro du niveau d'énergie, écrit à droite du diagramme
    let niveauEnergie = new createjs.Text("n = " + n, "20px Quicksand", 'black');
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
    /*
        Classe Transition
        Une transition possède une shape représentant la flèche de
        la transition et une flèche sinusoïdale représentant
        le photon.
        Elle possède également un texte indiquant, au bout de la
        flèche du photon, l'énergie de la transition.
    */
    constructor(x, y, E_initiale, E_finale, positionPhoton, numero, color=red, checked=false) {
        this.x = x;
        this.y = y;
        this.E_initiale = E_initiale;
        this.E_finale = E_finale;
        this.positionPhoton = positionPhoton;
        this.numero = numero;
        this.checked = false;
        
        // Création de la shape de la transition
        this.shape = shapeTransition(
            x, y,
            Math.abs(E_initiale - E_finale),
            positionPhoton,
            numero,
            color,
            E_initiale < E_finale
        );
        
        // Création du texte pour l'énergie de la transition
        this.texte = texteTransition(
            x, y,
            Math.abs(E_initiale - E_finale),
            positionPhoton,
            numero,
            color 
        );
    }
}

function shapeTransition(x, y, deltaE, positionPhoton, numero, color='red', isUp=false) {
    /*
        Cette fonction trace une flèche représentant la transion
        ainsi qu'une flèche sinusoïdale représentant le photon.
        Arguments :
            - x, y : position de la forme ;
            - deltaE : énergie de la transition ;
            - positionPhoton : position relative du
            photon le long de la flèche (entre 0 et 1) ;
            - numero : numéro de la transition ;
            - color : couleur de la shape (défaut : rouge) ;
            - isUp : indique le sens de la transition
            (vrai si absorption, faux si émission)
    */
    shape = new createjs.Shape();
    stage.addChild(shape);
    
    longueur = deltaE * facteur;    // longueur de la flèche
    frequence = deltaE / 3.02;      // fréquence pour la flèche du photon
    
    // tracé de la flèche
    shape.graphics.ss(3, 1, 1).s(color).mt(0, 0).lt(0, -longueur);
    switch (isUp) {
        // Absorption d'un photon : flèche vers le haut
        case true:
            // tracé de la flèche
            shape.graphics.ss(3, 1, 1).s(color).mt(-10, -longueur+10).lt(0, -longueur).lt(10, -longueur+10);
            
            // tracé du photon
            break;
        // Émission d'un photon : flèche vers le bas
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
    shape.cursor = 'grab';
    
    return shape;
}

function texteTransition(x, y, deltaE, positionPhoton, numero, color='red') {
    /*
        Cette fonction écrit la valeur de l'énergie de la transition.
        Arguments :
            - x, y : position de la forme ;
            - deltaE : énergie de la transition ;
            - positionPhoton : position relative du
            photon le long de la flèche (entre 0 et 1) ;
            - numero : numéro de la transition ;
            - color : couleur de la shape (défaut : rouge) ;
    */
    texte = new createjs.Text(
        "ΔE = " + deltaE.toLocaleString(
            'fr-FR',
            {maximumFractionDigits: 2}
        ) + " eV",
        "20px Quicksand",
        color
    );
    
    texte.x = x + 220;
    texte.y = y - positionPhoton * deltaE * facteur - 8;
    texte.name = "texte" + numero;
    stage.addChild(texte);
    
    return texte;
}

function onMouseDown(event) {
    /*
        Cette fonction calcule le décalage entre l'objet
        et la position de l'évènement lors d'un clic.
    */
    object = event.currentTarget;
    object.offsetX = object.x - event.stageX;
    object.offsetY = object.y - event.stageY;
}

function onPressMove(event) {
    /*
        Cette fonction met à jour le curseur et les graphes
        lors du déplacement d'un bouton.
    */
    object = event.currentTarget;
    numero = object.name.substr(5, 1);  // numéro de la transition
    transition = transitions[numero];
    
    // déplace la flèche et le photon
    object.x = Math.min(Math.max(graphe.x, event.stageX + object.offsetX), 950);
    object.y = Math.min(Math.max(0, event.stageY + object.offsetY), 750);
    
    // déplace le texte
    texte = transition.texte;
    texte.x = object.x + 220;
    texte.y = object.y
        - transition.positionPhoton
            * Math.abs(transition.E_initiale - transition.E_finale)
            * facteur
        - 8;
    
    stage.update();
}

function onPressUp(event) {
    /*
        Cette fonction place la transition correctement entre
        les niveaux d'énergie, lorsqu'elle est suffisamment bien
        placée par l'utilisateur.
    */
    object = event.currentTarget;
    numero = object.name.substr(5, 1);  // numéro de la transition
    transition = transitions[numero];
    
    // décalage vertical entre la flèche de la transition et le niveau d'énergie inférieur
    offset = object.y - (facteur*(-energies[4]) + graphe.y);

    if (
        Math.abs(offset) < 8
        // décalage inférieur à 8 pixels
        && object.x > graphe.x && object.x < graphe.x + xmax
        // la flèche se trouve dans les limites du diagramme  
    ) {
        object.y -= offset;
        transition.texte.y -= offset;
        stage.update();
        
        transition.checked = true;
    } else {
        transition.checked = false;
        tableau.setAttribute("class", "hidden");
    }
}

// paramètres des transitions
xList = [ 750, 800, 850, 900 ];
yList = [ 475, 475, 475, 475 ];
positionPhotonList = [ 0.975, 0.94, 0.85, 0.85 ];
colorList = [ 'purple', 'blue', 'rgba(0, 234, 229, 0.8)', 'red' ];

// création des transitions
transitions = [];
for (let numero = 0; numero < 4; numero++) {
    transition = new Transition(
            xList[numero], yList[numero],
            energies[numero], energies[4],
            positionPhotonList[numero],
            numero,
            colorList[numero]
        );
    transition.shape.addEventListener("mousedown", onMouseDown);
    transition.shape.addEventListener("pressmove", onPressMove);
    transition.shape.addEventListener("pressup", onPressUp);
    
    transitions.push(transition);
}

stage.update();




//======================================
//       Valider les transitions
//======================================

bouton = document.getElementById("validation");
tableau = document.getElementById("tableau");

bouton.addEventListener("mouseup", function(event) {
    /*
        Cet écouteur vérifie si les transitions sont bien
        positionnées lorsque l'utilisateur clique sur le
        bouton. Lorsque c'est le cas, les transitions sont
        fixées et la suite de l'activité apparaît.
    */
    for (transition of transitions) {
        if(!transition.checked) {
            return;     // retour si une des transitions n'est pas bien placée
        }
    }
    
    // Transitions fixes
    for (transition of transitions) {
        transition.shape.cursor = 'default';    // curseur par défaut
        
        // Suppression des écouteurs
        transition.shape.removeEventListener("mousedown", onMouseDown);
        transition.shape.removeEventListener("pressmove", onPressMove);
        transition.shape.removeEventListener("pressup", onPressUp);
    }
    
    // Affichage du formulaire
    tableau.appendChild(formulaire);
    tableau.appendChild(consignes_tableau);
    tableau.appendChild(table);
});




//======================================
//       Tableau longueurs d'onde
//======================================

const c = 3.00e8;       // célérité de la lumière dans le vide (m/s)
const h = 6.63e-34;     // constante de Planck (J.s)

function checkInput(input, checked_value, decimals) {
    /*
        Cette fonction vérifie qu'un input du formulaire est correct.
        Arguments :
            - input : l'input à vérifier ;
            - checked_value : la valeur attendue ;
            - decimals : le nombre de décimales à écrire.
        L'affichage correct/incorrect est géré par le CSS.
    */
    valeur = input.value;
    
    // le nombre peut être écrit avec un point ou une virgule
    if (valeur == checked_value.toFixed(decimals)
        || valeur == checked_value.toLocaleString('fr-FR', {maximumFractionDigits: decimals})
    ) {
        input.className = 'correct';
        return true;
    } else {
        input.className = 'incorrect';
        return false;
    }
}

// création du formulaire
formulaire = document.createElement("form");
formulaire.setAttribute("id", "formulaire");

// création du paragraphe de consignes
consignes_tableau = document.createElement("p");
consignes_tableau.innerText = "Compléter le tableau en convertissant"
    + " l'énergie des transitions en joule, puis en calculant"
    + " la longueur d'onde du rayonnement associé, en nanomètre."
    + " Attention aux chiffres significatifs !";
consignes_tableau.style.textAlign = "justify;"

// création du tableau
table = document.createElement("table");
table.setAttribute("id", "table_formulaire");

// première ligne du tableau
table.innerHTML = "<tr>"
    + "<td>&Delta;E (eV)</td>"
    + "<td>&Delta;E (&times; 10<sup>-19</sup> J)</td>"
    + "<td>&lambda; (nm)</td>"
    + "</tr>";

// création des lignes pour chaque transition
for (let numero = 0; numero < 4; numero++) {
    tr = document.createElement("tr");
    table.appendChild(tr);

    let deltaE_eV = energies[numero]-energies[4];

    // énergie en eV
    td_energie_eV = document.createElement("td");
    td_energie_eV.innerText = deltaE_eV.toLocaleString('fr-FR', {maximumFractionDigits: 2});
    tr.appendChild(td_energie_eV);

    // énergie en joule
    td_energie_J = document.createElement("td");
    tr.appendChild(td_energie_J);

    let input_energie_J = document.createElement("input");
    input_energie_J.setAttribute("type", "text");
    input_energie_J.setAttribute("name", "input_energie_J" + numero);
    input_energie_J.setAttribute("id", "input_energie_J" + numero);
    td_energie_J.appendChild(input_energie_J);

    let deltaE_J = deltaE_eV * 1.6e-19;
    input_energie_J.addEventListener("keyup", function(event) {
        checkInput(event.target, deltaE_J * 1e19, 2);
    });
    
    // longueur d'onde en nm
    td_longueur_onde = document.createElement("td");
    tr.appendChild(td_longueur_onde);

    let input_longueur_onde = document.createElement("input");
    input_longueur_onde.setAttribute("type", "text");
    input_longueur_onde.setAttribute("name", "input_longueur_onde" + numero);
    input_longueur_onde.setAttribute("id", "input_longueur_onde" + numero);
    td_longueur_onde.appendChild(input_longueur_onde);

    let longueur_onde = h * c / deltaE_J;
    console.log(longueur_onde * 1e9);
    input_longueur_onde.addEventListener("keyup", function(event) {
        checkInput(event.target, longueur_onde * 1e9, 0);
    });
}