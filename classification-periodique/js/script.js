const guidelines = document.getElementById("consignes");
const button = document.getElementById("validate");
const buttonContainer = button.parentNode;



const elementsList = [
    "lithium",
    "beryllium",
    "bore",
    "carbone",
    "azote",
    "oxygene",
    "fluor",
    "sodium",
    "magnesium",
    "aluminium",
    "silicium",
    "phosphore",
    "soufre",
    "chlore",
];
const newElementsList = ["potassium", "calcium", "selenium", "brome"];



// ===== Initialisation du canvas =====

const canvas = document.getElementById("workCanvas");
const stage = new createjs.Stage(canvas);
stage.enableMouseOver();
createjs.Touch.enable(stage);
stage.mouseMoveOutside = true;



// ===== Familles chimiques =====

/*
    Récupération des éléments div contenant les consignes
    pour la sélection des familles.
*/

const families = document.getElementById("familles");

const alkali = document.getElementById("alcalins");
families.removeChild(alkali);
alkali.style.backgroundColor = '#ffffcc';

const alkaliEarth = document.getElementById("alcalino-terreux");
families.removeChild(alkaliEarth);
alkaliEarth.style.backgroundColor = '#ecd9c6'

const halogens = document.getElementById("halogenes");
families.removeChild(halogens);
halogens.style.backgroundColor = '#adebad';

const carbonFamily = document.getElementById("carbone");
families.removeChild(carbonFamily);
carbonFamily.style.backgroundColor = '#e6e6e6';

const oxygenFamily = document.getElementById("oxygene");
families.removeChild(oxygenFamily);
oxygenFamily.style.backgroundColor = '#ffcccc';

const nitrogenFamily = document.getElementById("azote");
families.removeChild(nitrogenFamily);
nitrogenFamily.style.backgroundColor = '#ccf2ff';

// stocke les éléments sélectionnés lors de l'association aux familles
const selectedElements = [];
const highlightRectangles = [];
highlightRectangles.push(createHighlightRectangle());
highlightRectangles.push(createHighlightRectangle());



// shape pour mettre en évidence la périodicité
const periodicity = new createjs.Shape();





//============================================
//         Première classification
//============================================

/*
    Objectif : classer les 14 éléments chimiques (périodes 2 et 3,
    hors gaz nobles) par masse atomique croissante. Les éléments peuvent
    être déplacés et positionnés dans une ligne contenant 14 cases.
    Seuls le symbole chimique, le nom et la masse atomique des éléments
    sont indiqués.

    Mise en place :
        -> Tracé d'une figure "table" sous la forme d'une ligne de rectangles
        pour accueillir les éléments.
        -> Création des conteneurs des éléments chimiques grâce à
        createElementContainer, dans un ordre aléatoire grâce à shuffleArray.
        -> Ajout d'un eventListener sur le bouton pour valider le classement
        des éléments par masse atomique croissante.
*/

// ===== Tracé de la ligne =====

let table = new createjs.Shape();
stage.addChild(table);

const elementsNumber = elementsList.length;
let xTableStart = (canvas.width - (elementsNumber*elementRectangleWidth))/2;
let xTableEnd = (canvas.width + (elementsNumber*elementRectangleWidth))/2;
let yTableStart = 300;
let yTableEnd = yTableStart + elementRectangleHeight;

table.graphics.ss(3, 1, 1).s('black');
table.graphics.mt(xTableStart, yTableStart).lt(xTableEnd, yTableStart);
table.graphics.mt(xTableStart, yTableEnd);
table.graphics.lt(xTableEnd, yTableEnd);

for (i = 0; i < elementsNumber+1; i++) {
    let x = xTableStart + i * elementRectangleWidth;
    table.graphics.mt(x, yTableStart).lt(x, yTableEnd);
}



// ===== Création des éléments =====

function createElementContainer(x, y, symbol, elementName, atomicMass) {
    /*
        Crée un conteneur dans lequel sont placés les éléments
        décrivant un élément chimique :
            - symbole chimique ;        - nom de l'élément ;
            - masse atomique.
    */
    
    // création du conteneur
    let container = new createjs.Container();
    container.cursor = 'grab';
    container.x = x;
    container.y = y;
    container.zIndex = 2;
    container.name = "elementContainer_" + symbol;
    
    // ajout des caractéristiques de l'élément chimique
    container.addChild(createElementRectangle(symbol));
    container.addChild(createElementSymbol(symbol, symbol));
    container.addChild(createElementName(elementName, symbol));
    container.addChild(createAtomicMass(atomicMass, symbol));
    
    // déplacement du conteneur
    container.addEventListener("mousedown", mouseDownMove);
    container.addEventListener("pressmove", pressMoveMove);
    container.addEventListener("pressup", pressUpLine);

    return container;
}

function shuffleArray(array) {
    /*
        Cette fonction trie aléatoirement la liste des éléments.
    */
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

shuffleArray(elementsList);

let xStart = (canvas.width - (7*elementRectangleWidth + 6*40))/2 + 170;
let xEnd = xStart + (7*elementRectangleWidth + 6*40);
let x = xStart, y = 15;
const elementContainers = [];

for (key of elementsList) {
    if (x > xEnd) {
        y += 120;
        x = xStart;
    }
    element = elements[key];
    let container = createElementContainer(
        x, y,
        element['symbol'],
        element['name'],
        element['atomicMass']
    );
    stage.addChild(container);
    elementContainers.push(container);
    
    x += 110;
}

stage.update();

function moveTable(deltaY, postAction, up=true) {
    /*
        Déplace la table verticalement;
        Arguments :
            - deltaY : hauteur en pixels du déplacement vertical ;
            - postAction : fonction à réaliser après le déplacement ;
            - up : vrai si déplacement vers le haut / faux si
            déplacement vers le bas.
    */
    table.graphics.clear();

    let id = null;
    let pos = 0;
    clearInterval(id);
    id = setInterval(frame, 10);
    function frame() {
        if (pos == deltaY) {
            clearInterval(id);
            postAction();
        } else {
            if (up) {
                for (container of elementContainers) {
                    container.y--;
                }
            } else {
                for (container of elementContainers) {
                    container.y++;
                }
            }
            pos++;
            stage.update();
        }
    }
}



// ===== Validation =====

button.addEventListener("mousedown", validateMassOrder);

function validateMassOrder() {
    /*
        Vérifie que les éléments sont bien classés par masse croissante.
    */
    // vérification que chaque élément est bien positionné
    for (key of elementsList) {
        let symbol = elements[key]['symbol'];
        let Z = elements[key]['atomicNumber'];
        let container = stage.getChildByName("elementContainer_" + symbol);

        if (container.y != yTableStart) {
            return;
        } else if (Z < 10 && container.x != (xTableStart + (Z-3)*elementRectangleWidth)) {
            return;
        } else if (Z > 10 && container.x != (xTableStart + (Z-4)*elementRectangleWidth)) {
            return;
        }
    }
    
    // efface les consignes
    guidelines.style.visibility = 'hidden';
    guidelines.removeChild(buttonContainer);
    
    // modifie l'action du bouton
    button.removeEventListener("mousedown", validateMassOrder);
    button.addEventListener("mousedown", validateAlkali);
    buttonContainer.style.bottom = '20px';
    
    // déplace la table vers le haut
    moveTable(115, function() {
        for (key of elementsList) {
            fixElementContainer(key);
            // affiche les nouvelles consignes
            alkali.appendChild(buttonContainer);
            families.appendChild(alkali);
        }
        stage.update();
    });
}

function fixElementContainer(key) {
    /*
        Rend immobile le conteneur de l'élément chimique, auquel est
        ajouté son numéro atomique et une bulle d'information.
        Argument :
            - key : clé de l'élément dans elementsList.
    */
    // récupération du conteneur
    let symbol = elements[key]['symbol'];
    let atomicNumber = elements[key]['atomicNumber'];
    let infoText = elements[key]['infoText'];
    let container = stage.getChildByName("elementContainer_" + symbol);
    container.addChild(createAtomicNumber(atomicNumber, symbol));
    
    // informations sur l'élément
    let infoIcon = createInfoIcon(symbol);
    container.addChild(infoIcon);
    
    let infoContainer = createInfoContainer(infoText, symbol);    
    
    infoIcon.addEventListener("mouseover", event => {
        container.addChild(infoContainer);
        stage.setChildIndex(container, stage.children.length-1);
        stage.update();
    });
    
    infoIcon.addEventListener("mouseout", event => {
        container.removeChild(infoContainer);
        stage.update();
    });
    
    // immobilisation de l'élément
    container.removeEventListener("mousedown", mouseDownMove);
    container.removeEventListener("pressmove", pressMoveMove);
    container.removeEventListener("pressup", pressUpLine);
    
    // rendre l'élément sélectionnable pour la partie suivante
    container.addEventListener("mousedown", highlightElement);
    
    container.cursor = 'pointer';
}





//============================================
//        Identification des périodes
//============================================

/*
    Objectif : associer chaque élément à une famille chimique.
    Tour à tour, l'élève doit sélectionner les deux élements qui
    font partie de la famille chimique décrite, en s'aidant des
    bulles d'information figurant dans le conteneur de l'élément
    chimique. Lorsque les bons éléments ont été sélectionnés et
    que l'élève a validé, les éléments sont colorés (une couleur
    par famille) et ne peuvent plus être sélectionnés.

    Mise en place :
        -> Chaque élément dispose d'un écouteur highlightElement,
        qui permet de le sélectionner et l'encadre en rouge.
        -> Le bouton dispose d'un écouteur pour valider la sélection
        des éléments, en fonction de la famille chimique.
        -> Pour chaque famille, les éléments sont colorés après
        sélection et validation grâce à colorElements.
        -> Les consignes sont modifiées pour passer à la famille
        suivante, grâce à changeFamilyGuidelines.
*/

function colorElements(bkgColor) {
    /*
        Colore les éléments sélectionnés de la couleur indiquée.
        Argument :
            - bkgColor : couleur de fond de l'élément après validation.
    */
    for (i = selectedElements.length-1; i >= 0; i--) {
        let container = stage.getChildByName("elementContainer_" + selectedElements[i]);

        let rectangle = container.getChildByName("rectangle_" + selectedElements[i]);
        rectangle.graphics.clear();
        rectangle.graphics.ss(3, 1, 1).s('black').f(bkgColor);
        rectangle.graphics.rect(0, 0, elementRectangleWidth, elementRectangleHeight);

        // ôte le surlignage
        container.removeChild(highlightRectangles[i]);

        container.removeEventListener("mousedown", highlightElement);
        container.removeEventListener("mousedown", deleteHighlight)

        selectedElements.pop();   // supprime le dernier élément
    }        
    stage.update();
}

function changeFamilyGuidelines(familyFrom, familyTo) {
    /*
        Modifie les consignes pour la famille suivante.
        Arguments :
            - familyFrom : famille chimique dont l'élève devait
            sélectionner les éléments avant validation.
            - familyTo : nouvelle famille chimique à sélectionner.
    */    
    familyFrom.removeChild(buttonContainer);
    families.removeChild(familyFrom);
    familyTo.appendChild(buttonContainer);
    families.appendChild(familyTo);
}

function validateAlkali() {
    /*
        Valide le choix des éléments alcalins.
    */
    if (selectedElements.includes("Li") && selectedElements.includes("Na")) {
        colorElements(alkali.style.backgroundColor);
        changeFamilyGuidelines(alkali, alkaliEarth);
        button.removeEventListener("mousedown", validateAlkali);
        button.addEventListener("mousedown", validateAlkaliEarth);
    }
}

function validateAlkaliEarth() {
    /*
        Valide le choix des éléments alcalino-terreux.
    */
    if (selectedElements.includes("Be") && selectedElements.includes("Mg")) {
        colorElements(alkaliEarth.style.backgroundColor);
        changeFamilyGuidelines(alkaliEarth, halogens);
        button.removeEventListener("mousedown", validateAlkaliEarth);
        button.addEventListener("mousedown", validateHalogens);
    }
}

function validateHalogens() {
    /*
        Valide le choix des halogènes.
    */
    if (selectedElements.includes("F") && selectedElements.includes("Cl")) {
        colorElements(halogens.style.backgroundColor);
        changeFamilyGuidelines(halogens, carbonFamily);
        button.removeEventListener("mousedown", validateHalogens);
        button.addEventListener("mousedown", validateCarbonFamily);
    }
}

function validateCarbonFamily() {
    /*
        Valide le choix des éléments de la famille du carbone.
    */
    if (selectedElements.includes("C") && selectedElements.includes("Si")) {
        colorElements(carbonFamily.style.backgroundColor);
        changeFamilyGuidelines(carbonFamily, oxygenFamily);
        button.removeEventListener("mousedown", validateCarbonFamily);
        button.addEventListener("mousedown", validateOxygenFamily);
    }
}

function validateOxygenFamily() {
    /*
        Valide le choix des éléments de la famille de l'oxygène.
    */
    if (selectedElements.includes("O") && selectedElements.includes("S")) {
        colorElements(oxygenFamily.style.backgroundColor);
        changeFamilyGuidelines(oxygenFamily, nitrogenFamily);
        button.removeEventListener("mousedown", validateOxygenFamily);
        button.addEventListener("mousedown", validateNitrogenFamily);
    }
}

function validateNitrogenFamily() {
    /*
        Valide le choix des éléments de la famille de l'azote.
    */
    if (selectedElements.includes("N") && selectedElements.includes("P")) {
        nitrogenFamily.removeChild(buttonContainer);
        families.removeChild(nitrogenFamily);
        colorElements(nitrogenFamily.style.backgroundColor);
        button.removeEventListener("mousedown", validateNitrogenFamily);
        showPeriodicity();
    }
}

function showPeriodicity() {
    /*
        Trace, sous le tableau, une flèche par famille, pour montrer
        la périodicité de la classification.
    */
    stage.addChild(periodicity);
    
    animateDrawArrows();
    
    stage.update();
    
    const periodicityDiv = document.createElement("div");
    periodicityDiv.setAttribute("class", "famille");
    families.appendChild(periodicityDiv);
    periodicityDiv.innerHTML = "<p>Quelle que soit la famille chimique, les éléments qui la constituent sont séparés d'un même intervalle. On dit que la classification présente une périodicité, d'où le nom de classification périodique.</p>";
    periodicityDiv.style.top = '250px';
    periodicityDiv.style.height = '130px';

    buttonContainer.style.textAlign = 'center';
    buttonContainer.style.top = '10px';
    button.innerText = "J'ai compris !";
    periodicityDiv.appendChild(buttonContainer);
    button.addEventListener("mousedown", createPeriodicTable);
}

function animateDrawArrows() {
    /*
        Anime le tracé des flèches : elles apparaissent en s'allongeant
        progressivement jusqu'à atteindre leur taille finale.
    */
    let id = null;
    let frac = 0;
    clearInterval(id);
    id = setInterval(frame, 10);
    
    function frame() {
        if (frac >= 1) {
            clearInterval(id);
        } else {
            periodicity.graphics.clear();
            periodicity.graphics.ss(3, 1, 1);
            drawArrow(1, 90, '#ddddaa', frac);
            drawArrow(2, 110, alkaliEarth.style.backgroundColor, frac);
            drawArrow(4, 130, '#c0c0c0', frac);
            drawArrow(5, 150, '#bce2ef', frac);
            drawArrow(6, 170, oxygenFamily.style.backgroundColor, frac);
            drawArrow(7, 190, halogens.style.backgroundColor, frac);
            frac += 0.01;
            stage.update();
        }
    }
    
    function drawArrow(index, deltaY, color, frac) {
        /*
            Trace une flèche.
            Arguments :
                - index : position du premier élément de la famille
                dans la ligne ;
                - deltaY : fixe la position verticale de la flèche ;
                - color : couleur de la flèche ;
                - frac : fraction de la taille finale de la flèche.
        */
        periodicity.graphics.s(color);
        let start = xTableStart + ((index-1) + 0.5)*elementRectangleWidth;
        let end = start + frac*7*elementRectangleWidth;
        let y = 220 + deltaY;
        periodicity.graphics.mt(start, y);
        periodicity.graphics.lt(end, y);
        periodicity.graphics.mt(end-10, y+10).lt(end, y).lt(end-10, y-10);
    }
}





//============================================
//          Classement par période
//============================================

/*
    Objectif :
*/

function createPeriodicTable() {
    /*
        Trace une table périodique avec 2 périodes et 7 colonnes.
    */
    stage.removeChild(periodicity);
    
    // déplace la ligne des éléments chimiques vers le bas
    moveTable(
        50,
        function() {
            // tracé de la table périodique
            drawPeriodicTable();
            // affichage des consignes
            displayPeriodsGuidelines();
            
            for (container of elementContainers) {
                // supprimer la sélection des conteneurs
                container.removeEventListener("mousedown", highlightElement);
                // autoriser le déplacement des conteneurs    
                container.addEventListener("mousedown", mouseDownMove);
                container.addEventListener("pressmove", pressMoveMove);
                container.addEventListener("pressup", pressUpPeriodicTable);
                container.cursor = 'grab';
            }
        },
        false
    );
    
    while (families.firstChild) {
        families.removeChild(families.firstChild);
    }
}

function drawPeriodicTable() {
    /*
        Trace une table périodique vide avec 2 périodes et 7 colonnes.
    */
    table.graphics.clear();
    
    xTableStart = (canvas.width - (elementsNumber/2*elementRectangleWidth))/2;
    xTableEnd = xTableStart + elementsNumber/2 * elementRectangleWidth;
    yTableStart = 15;
    yTableEnd = yTableStart + 2*elementRectangleHeight;
    
    table.graphics.ss(3, 1, 1).s('black');
    table.graphics.mt(xTableStart, yTableStart).lt(xTableEnd, yTableStart);
    table.graphics.mt(xTableStart, (yTableStart+yTableEnd)/2).lt(xTableEnd, (yTableStart+yTableEnd)/2);
    table.graphics.mt(xTableStart, yTableEnd).lt(xTableEnd, yTableEnd);
    
    for (i = 0; i < elementsNumber/2+1; i++) {
        let x = xTableStart + i * elementRectangleWidth;
        table.graphics.mt(x, yTableStart).lt(x, yTableEnd);
    }
    
    stage.update();
}

function displayPeriodsGuidelines() {
    /*
        Affiche les consignes pour le classement des éléments par période.
    */
    guidelines.style.visibility = 'visible';
    guidelines.style.top = "450px";
    guidelines.style.left = "0";
    guidelines.style.width = "100%";
    guidelines.style.textAlign = 'justify';
    
    let paragraph = document.createElement("p");
    paragraph.style.width = "75%";
    paragraph.style.margin = 'auto';
    paragraph.innerText = "Placer les éléments dans le tableau ci-dessus. La règle de classification précédente est conservée : les éléments doivent se suivre par masse croissante. De plus, les éléments d'une même famille sont placés dans la même colonne.";
    paragraph.appendChild(buttonContainer);
    
    buttonContainer.style.textAlign = 'right';
    buttonContainer.style.top = '10px';
    button.innerText = "Valider";
    button.addEventListener("mousedown", validatePeriodicTable);
    button.removeEventListener("mousedown", createPeriodicTable);
    
    while (guidelines.firstChild) {
        guidelines.removeChild(guidelines.firstChild);
    }
    guidelines.appendChild(paragraph);
}

function validatePeriodicTable() {
    /*
        Valide le classement des éléments par période.
    */
    for (key of elementsList) {
        // Vérification que l'élément est bien positionné
        let symbol = elements[key]['symbol'];
        let Z = elements[key]['atomicNumber'];
        let container = stage.getChildByName("elementContainer_" + symbol);

        if (Z < 10) {
            if (container.x != (xTableStart + (Z-3)*elementRectangleWidth)
                || container.y != yTableStart) {
                return;
            }
        } else if (Z > 10) {
            if (container.x != (xTableStart + (Z-11)*elementRectangleWidth)
                || container.y != (yTableStart+elementRectangleHeight)) {
                return;
            }
        }
        
        container.removeEventListener("mousedown", mouseDownMove);
        container.removeEventListener("pressmove", pressMoveMove);
        container.removeEventListener("pressup", pressUpLine);
        
        container.cursor = 'default';
    }
    
    completeTable();
}





//============================================
//        Placer quelques éléments
//============================================

function completeTable() {
    yTableStart = yTableEnd;
    yTableEnd = yTableEnd + elementRectangleHeight;
    table.graphics.mt(xTableStart, yTableEnd);
    table.graphics.lt(xTableEnd, yTableEnd);
    for (i = 0; i < elementsNumber/2+1; i++) {
        let x = xTableStart + i * elementRectangleWidth;
        table.graphics.mt(x, yTableEnd).lt(x, yTableEnd-elementRectangleHeight);
    }
    
    let xList = [
        xTableStart-220,
        xTableStart-110,
        xTableEnd+110-elementRectangleWidth,
        xTableEnd+220-elementRectangleWidth
    ];
    shuffleArray(newElementsList);
    
    for (i = 0; i < newElementsList.length; i++) {
        element = elements[newElementsList[i]];
        symbol = element['symbol'];
        let container = createElementContainer(
            xList[i],
            yTableStart-5/3*elementRectangleHeight,
            symbol,
            element['name'],
            element['atomicMass']
        );
        stage.addChild(container);
        
        container.addChild(createAtomicNumber(element['atomicNumber'], symbol));
    
        // informations sur l'élément
        let infoIcon = createInfoIcon(symbol);
        container.addChild(infoIcon);
    
        let infoContainer = createInfoContainer(element['infoText'], symbol);    
    
        infoIcon.addEventListener("mouseover", event => {
            container.addChild(infoContainer);
            stage.setChildIndex(container, stage.children.length-1);
            stage.update();
        });
    
        infoIcon.addEventListener("mouseout", event => {
            container.removeChild(infoContainer);
            stage.update();
        });
    }
    
    stage.update();
    
    completeTableGuidelines();
}

function completeTableGuidelines() {
    let id = null;
    let opacity = 1;
    clearInterval(id);
    id = setInterval(disappear, 10);
    function disappear() {
        if (opacity <= 0) {
            clearInterval(id);
            
            let paragraph = guidelines.getElementsByTagName("p")[0];
            paragraph.innerHTML = "À l'aide des bulles d'information, placer les 4 nouveaux éléments dans la 3<sup>e</sup> ligne de la classification, en les plaçant dans la colonne correspondant à leur famille."
            paragraph.appendChild(buttonContainer);
            
            button.removeEventListener("mousedown", validatePeriodicTable);
            button.addEventListener("mousedown", validateCompleteTable);
            
            id = setInterval(appear, 20);
            let op = 0;
            function appear() {
                if (op == 1) {
                    clearInterval(id);
                } else {
                    op += 0.01;
                    guidelines.style.opacity = op;
                }
            }
        } else {
            opacity -= 0.01;
            guidelines.style.opacity = opacity;
        }
    }
}

function validateCompleteTable() {
    let checkPotassium = checkElement("K", xTableStart, alkali.style.backgroundColor);
    let checkCalcium = checkElement("Ca", xTableStart+elementRectangleWidth, alkaliEarth.style.backgroundColor);
    let checkSelenium = checkElement("Se", xTableStart+5*elementRectangleWidth, oxygenFamily.style.backgroundColor);
    let checkBromine = checkElement("Br", xTableStart+6*elementRectangleWidth, halogens.style.backgroundColor);
    if (checkPotassium && checkCalcium && checkSelenium && checkBromine) {
        button.removeEventListener("mousedown", validateCompleteTable);
    }
}

function checkElement(symbol, xGood, bkgColor) {
    let container = stage.getChildByName("elementContainer_" + symbol);
    
    if (container.x != xGood || container.y != yTableStart) {
        return false;
    }
    
    let rectangle = container.getChildByName("rectangle_" + symbol);
    rectangle.graphics.clear();
    rectangle.graphics.ss(3, 1, 1).s('black').f(bkgColor);
    rectangle.graphics.rect(0, 0, elementRectangleWidth, elementRectangleHeight);
    
    container.removeEventListener("mousedown", mouseDownMove);
    container.removeEventListener("pressmove", pressMoveMove);
    container.removeEventListener("pressup", pressUpLine);

    container.cursor = 'default';
    
    stage.update();
            
    return true;
}






// for (key of elementsList) {
//     // Vérification que l'élément est bien positionné
//     let symbol = elements[key]['symbol'];
//     let Z = elements[key]['atomicNumber'];
//     let container = stage.getChildByName("elementContainer_" + symbol);
//
//     container.y = yTableStart;
//     if (Z < 10) {
//         container.x = (xTableStart + (Z-3)*elementRectangleWidth)
//     } else {
//         container.x = (xTableStart + (Z-4)*elementRectangleWidth)
//     }
// }
//
// validateMassOrder();
// selectedElements.push("Li");
// selectedElements.push("Na");
// validateAlkali();
// selectedElements.push("Be");
// selectedElements.push("Mg");
// validateAlkaliEarth();
// selectedElements.push("F");
// selectedElements.push("Cl");
// validateHalogens();
// selectedElements.push("C");
// selectedElements.push("Si");
// validateCarbonFamily();
// selectedElements.push("O");
// selectedElements.push("S");
// validateOxygenFamily();
// selectedElements.push("N");
// selectedElements.push("P");
// validateNitrogenFamily();