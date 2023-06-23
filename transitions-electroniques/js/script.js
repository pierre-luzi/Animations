/*
Cette animation permet d'afficher les raies d'absorption et d'émission
visibles de quelques éléments chimiques, ainsi que les transitions
énergétiques correspondantes.

Structure du code :
    - 2 canvas : canvasSpectres et canvasDiagramme ;
    - chaque canva comprend 1 stage ;
    - "stageSpectres" comprend 3 stages :
        -> "spectres" contient un spectre coloré
            et un spectre vierge (noir) ;
        -> "raies" contient les raies d'émission
            et d'absorption, cliquables ;
        -> "elements" permet de sélectionner l'élément
            chimique dont le spectre est affiché.
*/

function wavelengthToRGB(wavelength, gamma=0.8) {
    /*
        Cette fonction convertit une longueur d'onde 
        en une couleur au format RGB. La longueur d'onde
        doit être exprimée en nanomètres et comprise entre
        380 et 750 (789 THz - 400 THz).

        Based on code by Dan Bruton
        http://www.physics.sfasu.edu/astro/color/spectra.html
    */
    
    let R = 0.0;
    let G = 0.0;
    let B = 0.0;
    
    if (wavelength >= 380 && wavelength <= 440) {
        let attenuation = 0.3 + 0.7 * (wavelength - 380) / (440 - 380);
        R = ((-(wavelength - 440) / (440 - 380)) * attenuation) ** gamma;
        G = 0.0;
        B = (1.0 * attenuation) ** gamma;
    } else if (wavelength >= 440 && wavelength <= 490) {
        R = 0.0;
        G = ((wavelength - 440) / (490 - 440)) ** gamma;
        B = 1.0;
    } else if (wavelength >= 490 && wavelength <= 510) {
        R = 0.0;
        G = 1.0;
        B = (-(wavelength - 510) / (510 - 490)) ** gamma;
    } else if (wavelength >= 510 && wavelength <= 580) {
        R = ((wavelength - 510) / (580 - 510)) ** gamma;
        G = 1.0;
        B = 0.0;
    } else if (wavelength >= 580 && wavelength <= 645) {
        R = 1.0;
        G = (-(wavelength - 645) / (645 - 580)) ** gamma;
        B = 0.0;
    } else if (wavelength >= 645 && wavelength <= 750) {
        let attenuation = 0.3 + 0.7 * (750 - wavelength) / (750 - 645);
        R = (1.0 * attenuation) ** gamma;
        G = 0.0;
        B = 0.0;
    }
    
    return [R*255, G*255, B*255];
}

// Liste des éléments
const elements = {
    hydrogene: {
        nom: 'Hydrogène',
        energies: [-0.38, -0.54, -0.85, -1.51, -3.39]
    },
    helium: {
        nom: 'Helium',
        energies: [-0.54, -0.85, -1.52, -1.87, -3.38, -3.63, -3.98]
    },
    lithium: {
        nom: 'Lithium',
        energies: [-1.52, -2.02, -3.55, -5.41]
    },
    cesium: {
        nom: 'Césium',
        energies: [-1.39, -2.29, -2.61, -3.61, -5.00]
    }
};

// Position des spectres
const yAbsorption = 330;
const yEmission = 180;

// Constantes fondamentales
const c = 3.00e8;       // célérité de la lumière dans le vide (m/s)
const h = 6.63e-34;     // constante de Planck (J.s)



//======================================
//       Sélection de l'élément
//======================================

function selectElement(key) {
    /*
        Cette fonction met à jour l'élément chimique sélectionné
        ainsi que les spectres et le diagramme énergétique
        affichés.
    */
    
    // mise à jour de l'élément sélectionné
    let divElements = divListElements.children;
    for (divElement of divElements) {
        if (divElement == event.target) {
            divElement.setAttribute("class", "selectedElement");
        } else {
            divElement.setAttribute("class", "unselectedElement");
        }
    }
    
    // mise à jour du diagramme et des spectres
    graphe.removeAllChildren();
    raies.removeAllChildren();
    transition.graphics.clear();
    texteEnergie.text = "";
    texteWavelength.text = "";
    
    energies = elements[key]['energies'];
    facteur = (canvasDiagramme.height - 90) / (energies[0] - energies[energies.length-1]);
    
    createDiagramme();
    createRaies();
    stageDiagramme.update();
    stageSpectres.update();
}

divListElements = document.getElementById("listElements");

for (const [key, element] of Object.entries(elements)) {
    div = document.createElement("div");
    div.setAttribute("id", "div_" + key);
    div.setAttribute("class", "unselectedElement");
    div.innerText = element['nom'];    
    div.addEventListener("mousedown", selectElement.bind(event, key));
    divListElements.appendChild(div);
}

let energies = elements['hydrogene']['energies'];
firstDiv = document.getElementById("div_hydrogene");
firstDiv.setAttribute("class", "selectedElement");




//======================================
//              Spectres
//======================================

canvasSpectres = document.getElementById("canvasSpectres");
stageSpectres = new createjs.Stage(canvasSpectres);
stageSpectres.enableMouseOver();
createjs.Touch.enable(stageSpectres);
stageSpectres.mouseMoveOutside = true;

spectres = new createjs.Container();
spectres.x = 0;
spectres.y = 30;
stageSpectres.addChild(spectres);

spectreAbsorption = new createjs.Shape();
spectreAbsorption.graphics.ss(1, 1, 1);
spectreAbsorption.x = 100;
spectreAbsorption.y = yAbsorption;

titreAbsorption = new createjs.Text("Spectre d'absorption", "20px Quicksand", 'black');
titreAbsorption.x = 100 + 380*0.5;
titreAbsorption.y = yAbsorption-30;
titreAbsorption.textAlign = 'center';

spectreEmission = new createjs.Shape();
spectreEmission.graphics.ss(1, 1, 1);
spectreEmission.x = 100;
spectreEmission.y = yEmission;

titreEmission = new createjs.Text("Spectre d'émision", "20px Quicksand", 'black');
titreEmission.x = 100 + 380*0.5;
titreEmission.y = yEmission-30;
titreEmission.textAlign = 'center';

// tracé des spectres
for (let wavelength = 380; wavelength < 751; wavelength++) {
    // spectre d'absorption
    spectreAbsorption.graphics.s("rgba(" + wavelengthToRGB(wavelength) + ",1.0)");
    spectreAbsorption.graphics.mt(wavelength-380, 0).lt(wavelength-380, 80);

    // spectre d'émission
    spectreEmission.graphics.s('black');
    spectreEmission.graphics.mt(wavelength-380, 0).lt(wavelength-380, 80);
}

spectres.addChild(spectreAbsorption);
spectres.addChild(spectreEmission);
spectres.addChild(titreAbsorption);
spectres.addChild(titreEmission);





//======================================
//       Diagramme énergétique
//======================================

canvasDiagramme = document.getElementById("canvasDiagramme");
stageDiagramme = new createjs.Stage(canvasDiagramme);

// limites du graphe
const xmax = 500;

// échelle d'énergie
// const facteur = 130;
let facteur = (canvasDiagramme.height - 90) / (energies[0] - energies[energies.length-1]);

// création d'un container graphique
graphe = new createjs.Container();
stageDiagramme.addChild(graphe);
graphe.x = 100;
graphe.y = 60;

function createDiagramme() {
    // création d'une shape pour le diagramme énergétique
    diagramme = new createjs.Shape();
    graphe.addChild(diagramme);

    // tracé de l'axe vertical
    diagramme.graphics.ss(3, 1, 1).s('black').mt(0, -25).lt(0, -facteur*energies[energies.length-1]+15);
    diagramme.graphics.mt(-10, -15).lt(0, -25).lt(10, -15);

    // tracé de l'état ionisé
    // diagramme.graphics.mt(-10, 0).lt(xmax, 0);

    // valeur de l'énergie de l'état ionisé
    // valeurEnergie = new createjs.Text("0,00", "20px Quicksand", 'black');
    // valeurEnergie.x = -63;
    // valeurEnergie.y = -10;
    // valeurEnergie.textBaseLine = "middle";
    // graphe.addChild(valeurEnergie);

    // tracé des niveaux d'énergie
    for (energie of energies) {
        y = -facteur * (energie - energies[0]);
        diagramme.graphics.mt(-10, y).lt(xmax, y);
    
        // Valeur de l'énergie, écrite à gauche du diagramme
        let valeurEnergie = new createjs.Text(energie.toLocaleString('fr-FR', {maximumFractionDigits: 2}), "20px Quicksand", 'black');
        valeurEnergie.x = -70;
        valeurEnergie.y = y-10;
        valeurEnergie.textBaseLine = "middle";    
        graphe.addChild(valeurEnergie);
    }
}

createDiagramme();
stageDiagramme.update();





//======================================
//       Création des transitions
//======================================

// ===== Tracé des transitions =====

const transition = new createjs.Shape();
stageDiagramme.addChild(transition);

const texteEnergie = new createjs.Text("", "20px Quicksand", 'black');
stageDiagramme.addChild(texteEnergie);

function traceTransition(x, y, deltaE, positionPhoton, color='red', isAbsorption=false) {
    /*
        Cette fonction met à jour la flèche, le photon et le texte
        associés à la transition sur le diagramme énergétique.
    */
    flecheTransition(x, y, deltaE, positionPhoton, color, isAbsorption);
    texteTransition(x, y, deltaE, positionPhoton, color);    
    stageDiagramme.update();
}

function flecheTransition(x, y, deltaE, positionPhoton, color='red', isAbsorption=false) {
    /*
        Cette fonction trace une flèche représentant la transition
        ainsi qu'une flèche sinusoïdale représentant le photon.
        Arguments :
            - x, y : position de la forme ;
            - deltaE : énergie de la transition ;
            - positionPhoton : position relative du
            photon le long de la flèche (entre 0 et 1) ;
            - numero : numéro de la transition ;
            - color : couleur de la shape (défaut : rouge) ;
            - isAbsorption : indique le sens de la transition
            (vrai si absorption, faux si émission)
    */
    transition.graphics.clear();

    let longueur = deltaE * facteur;    // longueur de la flèche
    let frequence = deltaE / 3.02;      // fréquence pour la flèche du photon
    yPhoton = -positionPhoton * longueur;   // ordonnée du photon

    // tracé de la flèche
    transition.graphics.ss(3, 1, 1).s(color).mt(0, 0).lt(0, -longueur);
    switch (isAbsorption) {
        // Absorption d'un photon : flèche vers le haut
        case true:
            // tracé de la flèche
            transition.graphics.mt(-10, -longueur+10).lt(0, -longueur).lt(10, -longueur+10);
            
            // tracé du photon
            transition.graphics.mt(200, yPhoton - 6 * Math.sin(frequence * (200-45)/5));
            for (let i = 199; i > 44; i--) {
                transition.graphics.lt(i, yPhoton - 6 * Math.sin(frequence * (i-45)/5));
            }
            transition.graphics.lt(35, yPhoton);
            transition.graphics.mt(35, yPhoton+8).lt(20, yPhoton).lt(35, yPhoton-8).lt(35, yPhoton+8);
            
            break;
        // Émission d'un photon : flèche vers le bas
        case false:
            // tracé de la flèche
            transition.graphics.mt(-10, -10).lt(0, 0).lt(10, -10);

            // tracé du photon
            transition.graphics.mt(20, yPhoton + 6 * Math.sin(frequence * (20-175)/5));
            for (let i = 21; i < 176; i++) {
                transition.graphics.lt(i, yPhoton + 6 * Math.sin(frequence * (i-175)/5));
            }
            transition.graphics.lt(185, yPhoton);
            transition.graphics.mt(185, yPhoton+8).lt(200, yPhoton).lt(185, yPhoton-8).lt(185, yPhoton+8);
            
            break;
    }

    transition.x = x;
    transition.y = y;
}

function texteTransition(x, y, deltaE, positionPhoton, color='red') {
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
    texteEnergie.text = "ΔE = "
        + deltaE.toLocaleString('fr-FR', {maximumFractionDigits: 2})
        + " eV";
    texteEnergie.x = x + 220;
    texteEnergie.y = y - positionPhoton * deltaE * facteur - 8;
    texteEnergie.color = color;
}

function positionPhoton(first, last) {
    /*
        Cette fonction calcule la position de la flèche du photon.
        Le photon doit être positionné entre les deux niveaux d'énergie
        successifs les plus éloignés l'un de l'autre, entre le niveau
        initial et le niveau final.
    */
    let index = 0;
    let deltaE = 0;
    for (let k = first ; k < last; k++) {
        let deltaE_k = Math.abs(energies[k]-energies[k+1]);
        if (deltaE_k > deltaE) {
            deltaE = deltaE_k;
            index = k;
        }
    }
    return (0.5 * (energies[index] + energies[index+1]) - energies[last]) / (energies[first] - energies[last]);
}



// ===== Tracé des raies =====

const raies = new createjs.Container();
raies.x = 0;
raies.y = 30;
stageSpectres.addChild(raies);

const texteWavelength = new createjs.Text("", "16px Quicksand", 'black');
stageSpectres.addChild(texteWavelength);

function createRaieAbsorption(wavelength, i, j) {
    /*
        Cette fonction crée une raie noire sur le spectre de la lumière
        visible (raie d'asorption).
        Lorsque l'utilisateur clique sur la raie, la transition électronique
        correspondante est affichée sur le diagramme énergétique.
    */
    let raieAbsorption = new createjs.Shape();
    raieAbsorption.graphics.ss(1, 1, 1).s('black');
    raieAbsorption.graphics.mt(wavelength-380, 0).lt(wavelength-380, 80);
    raieAbsorption.x = 100;
    raieAbsorption.y = yAbsorption;
    raieAbsorption.cursor = "pointer";
    raies.addChild(raieAbsorption);

    // crée une fonction à partir de la fonction traceTransition, en fixant les arguments
    let transitionEvent = traceTransition.bind(
        null,
        200,
        -facteur * (energies[j]-energies[0]) + graphe.y,
        Math.abs(energies[i] - energies[j]),
        positionPhoton(i, j),
        color,
        isAbsorption=true
    );
    
    let wavelengthEvent = texteLongueurOnde.bind(null, wavelength, color, isAbsorption=true);

    // ajout d'un écouteur pour afficher la transition lors d'un clic
    raieAbsorption.addEventListener("mousedown", transitionEvent);
    raieAbsorption.addEventListener("mousedown", wavelengthEvent);
}

function createRaieEmission(wavelength, i, j) {
    /*
        Cette fonction crée une raie colorée sur le spectre noir (raie d'émission).
        Lorsque l'utilisateur clique sur la raie, la transition électronique
        correspondante est affichée sur le diagramme énergétique.
    */
    let raieEmission = new createjs.Shape();
    raieEmission.graphics.ss(1, 1, 1);
    raieEmission.graphics.s(color);
    raieEmission.graphics.mt(wavelength-380, 0).lt(wavelength-380, 80);
    raieEmission.x = 100;
    raieEmission.y = yEmission;
    raieEmission.cursor = "pointer";
    raies.addChild(raieEmission);

    let transitionEvent = traceTransition.bind(
        null,
        200,
        -facteur * (energies[j]-energies[0]) + graphe.y,
        Math.abs(energies[i] - energies[j]),
        positionPhoton(i, j),
        color, isAbsorption=false
    );
    
    let wavelengthEvent = texteLongueurOnde.bind(null, wavelength, color, isAbsorption=false);
    
    // ajout d'un écouteur pour afficher la transition lors d'un clic
    raieEmission.addEventListener("mousedown", transitionEvent);
    raieEmission.addEventListener("mousedown", wavelengthEvent);
}

function texteLongueurOnde(wavelength, color, isAbsorption) {
    /*
        Cette fonction affiche la longueur d'onde de la raie
        sélectionnée, en-dessous du spectre.
    */
    texteWavelength.x = 65 + wavelength - 380;
    if (isAbsorption) {
        texteWavelength. y = yAbsorption + 120;
    } else {
        texteWavelength.y = yEmission + 120;
    }
    texteWavelength.text = "λ = " + wavelength.toLocaleString('fr-FR', {maximumFractionDigits: 0}) + " nm";
    texteWavelength.color = color;
    stageSpectres.update();
}



// ===== Création des raies =====

function createRaies() {
    /*
        Cette fonction crée les raies d'absorption et d'émission
        de l'élement sélectionné :
        - chaque raie est affichée sur le spectre correspondant ;
        - à chaque raie est affecté un écouteur pour déclencher
        l'affichage de la transition lors d'un clic.
    */
    for (let i = 0; i < energies.length-1; i++) {       // boucle sur tous les niveaux d'énergie
        for (let j = i+1; j < energies.length; j++) {   // boucle sur les autres niveaux d'énergie
            let wavelength = h * c / (energies[i] - energies[j]) * 1e9 / 1.6e-19;
            if (wavelength < 380 || wavelength > 750) {
                continue; // ignorer les transitions hors visible
            }
            
            color = "rgba(" + wavelengthToRGB(wavelength) + ",1.0)";

            // création des raies
            createRaieAbsorption(wavelength, i, j);
            createRaieEmission(wavelength, i, j);
        }
    }
}





//======================================
//           Initialisation
//======================================

createRaies();
stageSpectres.update();