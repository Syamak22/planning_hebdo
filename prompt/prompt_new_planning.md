# Informations globales sur la logique 

## Les fields de la base de donnée

Chaque ligne dans cette interface permet de créer un enregistrement dans une table "planning_jouranlier"

1 enregistrement possède plusieurs field : 

- chantiers : relation avec table "chantier" (liste)
- commentaire : texte - nullable
- date_complete_jour : date
- equipe : relation avec table "user" (liste)
- motif_absence : option set (qui donne les différents types d'absence pour la zone absence). La liste sera donnée de manière dynamque dans le plug in. Pour ainsi pouvoir ajouter des motifs au besoin. - nullable
- poste_atelier : option set (qui donne le poste sur lequel est l'équipe, dans le cas ou le type est atelier par exemple) - nullable
- sous_traitants : relation avec table "contacts" (liste) - nullable
- type_planning : option set qui permet de savoir dans quelle zone du planning on est.
Note : pour les OS penser à bien prendre les display (il n'y a pas d'ID comme les fields des tables)
- vehicule : relation avec table "vehicule" - nullable

## En-tête

Affichage de la date du jour.
Bouton copie qui copie la veille.
Déclenche event "copy_globale_planning"
Bouton imprimer qui permettra d'imprimer la totalité du planning sans les pools. Ouvre une page html blank et ouvre l'éditeur d'impression.
Tu peux reprendre ce que tu as déja fait dans _v3_avant_grosse_maj_

## Les zones et les pools

On a des zones, des pools, et des tags.

Chaque zone est indépendante et possède des pools associés.
Chaque zone possède un bouton pour copier le planning de la veille (correspondant uniquement à sa zone).

Zone "chantier", associé pool "equipiers", pool "sous-traitants", pool "véhicules", et pool "chantiers"
Zone "transport", associé pool "Chantier transports"
Zone "Atelier", associé pool "Chantier K2", pool "Chantier finition K2", pool "Chantier fabrication"

Chaque tags dans un pool "chantiers xxx" peut etre drag and drop uniquement dans sa zone ou dans son pool.
Exemple : 1 chantier dans "chantiers transports" ne peut pas aller dans la colonne "chantiers associés" de la zone zone chantier, mais uniquement dans la colonne "chantiers associés" de la zone "transport".

Uniquement les équipiers peuvent etre placé dans n'importe quelle colonne equipier de n'importe quelle zone.
Idem pour les vehicules.

Dans le cas de la zone chantier, un sous traitant ou un equipier peuvent aller tous le dans la colonne "equipiers".

Lorsqu'un pool est vide inscrire ne rien inscrire, le laisser vide.

A chaque fois qu'un equipier est positionné il est déplacé de son pool et ne peut pas être placé ailleurs. Si on le retire il revient dans son pool. Idem pour le véhicule.


# Informations par zone


## Zone "Chantier"

Colonne "chantiers associés", on peut avoir 1 ou plusieurs chantiers
Colonne "equipiers", on peut avoir 1 ou plusieurs equipier et/ou 1 ou plusieurs sous-traitant.
Colonne "véhicule" c'est cette colonne qui va définir l'ordre des lignes. Chaque numéro de véhicule définira l'ordre de la ligne. Véhicule "0-xxxx" sera la ligne 1, "1-xxxx" ligne 2 etc ...
Colonne commentaire, 1 click dessus permettra de saisir un commentaire.

Le bouton "ajouter une ligne" permettra d'ajouter momentanément une ligne l'enregistrement en BDD figera la ligne. 1 ligne en base avec le type de la zone créera une ligne sur le planning.
Quand on clique sur la zone dropable de la colonne chantier, un dropdown s'affiche avec une liste de chantier et on peut selectionner un chantier parmis ceux dispo en BDD.


## Zone "Transport"

Colonne "chantiers associés", on peut avoir 1 ou plusieurs chantiers
Colonne "equipiers", on peut avoir 1 ou plusieurs equipier et/ou 1 ou plusieurs sous-traitant.
Colonne véhicule, idem que sur zone chantier
Colonne commentaire, 1 click dessus permettra de saisir un commentaire.

Le pool "chantier transport" se videra à chaque drop d'un chantier

Le bouton "ajouter une ligne" permettra d'ajouter momentanément une ligne l'enregistrement en BDD figera la ligne. 1 ligne en base avec le type de la zone créera une ligne sur le planning.
Quand on clique sur la zone dropable de la colonne chantier, un dropdown s'affiche avec une liste de chantier et on peut selectionner un chantier parmis ceux dispo en BDD.

## Zone "Atelier"

Colonne "poste", permet de définir le poste à l'atelier, on donnera ca dans une properties ca sera une liste d'OS
Colonne "chantiers associés", on peut avoir 1 ou plusieurs chantiers
Colonne "equipiers", on peut avoir 1 ou plusieurs equipier et/ou 1 ou plusieurs sous-traitant.
Colonne commentaire, 1 click dessus permettra de saisir un commentaire.

Les pool de cette zaone se videront à chaque drop d'un chantier

Le bouton "ajouter une ligne" permettra d'ajouter momentanément une ligne l'enregistrement en BDD figera la ligne. 1 ligne en base avec le type de la zone créera une ligne sur le planning.
Quand on clique sur la zone dropable de la colonne chantier, un dropdown s'affiche avec une liste de chantier et on peut selectionner un chantier parmis ceux dispo en BDD.

## Zone "Bureau"

Colonne "equipiers", on peut avoir 1 ou plusieurs equipier et/ou 1 ou plusieurs sous-traitant.
Colonne commentaire, 1 click dessus permettra de saisir un commentaire.

## Zone "Absence"

Cette zone sera pré-rempli, mais on peut tout de meme mettre des equipier dans les colonnes qu'on veut.


# Informations techniques

Mettre en tête de fichier de initialize.js toutes les constantes qui servent le code. Comme les noms des pools, des colonnes, des messages fixes etc ... toute data hard codée dans le fichier.
De cette façon on peut facilement modifier les termes utilisés.

Utiliser le drag and drop natif de html.

Si un tag est dropé dans une zone interdite il revient à sa place.

Mettre en place de l'optimisitc UI pour toutes les actions.

Toujours créer une animation pour voir quel groupe est hover lorsque qu'on veut drop un element.