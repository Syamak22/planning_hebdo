# Properties

voici la liste des properties à utiliser dans le plug in.

## Global au plug in

- day_date : type date, afficher le planning à cette date.

## CHANTIER

### Global aux chantiers
- field_ch_name : field nom du chantier à traiter comme du texte. Utilisé pour le display des noms.

### Liste des chantiers dans dropdown de sélection de chantier
- table_ch : liste objet bubble chantier à traiter comme un objet bubble.

### Zone chantier : liste des chantiers dans le pool des chantiers du jour
- table_ch_jour : liste objet bubble chantier à traiter comme un objet bubble

### Zone transport : liste des chantiers dans le pool des chantiers transport
- table_ch_transport : liste objet bubble chantier à traiter comme un objet bubble

### Zone atelier : liste des chantiers dans le pool des chantiers K2
- table_ch_k2 : liste objet bubble chantier à traiter comme un objet bubble

### Zone atelier : liste des chantiers dans le pool des chantiers finition K2
- table_ch_fin_k2 : liste objet bubble chantier à traiter comme un objet bubble

### Zone atelier : liste des chantiers dans le pool des chantiers fabrication
- table_ch_fab : liste objet bubble chantier à traiter comme un objet bubble


## POOL EQUIPIERS

- table_user : liste objet bubble user à traiter comme un objet bubble
- field_user_name : field nom du user à traiter comme du texte. Utilisé pour le display des noms.

## POOL SOUS-TRAITANTS

- table_stt : liste objet bubble contact à traiter comme un objet bubble
- field_stt_name : field nom du contact à traiter comme du texte. Utilisé pour le display des noms.

## POOL VEHICULES

- table_veh : liste objet bubble vehicule à traiter comme un objet bubble
- field_veh_name : field nom du vehicule à traiter comme du texte. Utilisé pour le display des noms.
- liste_veh_indispo : liste objet bubble vehicule à traiter comme un objet bubble. Utilisé pour distinguer visuellement les vehciules indspo. Les tags seront grisés.
- field_conduc1 : field relation avec la table user à traiter comme un objet bubble. Utilisé pour  distinguer visuellement le véhicule d'un equipier quand on le drag. Il se met en sur_brillance quand un equipier est drag et qu'il est conducteur
- field_condu2 : field relation avec la table user à traiter comme un objet bubble. Utilisé pour  distinguer visuellement le véhicule d'un equipier quand on le drag. Il se met en sur_brillance quand un equipier est drag et qu'il est conducteur
- field_ordre : field type nombre pour ranger par ordre croissant les véhicule

## ABSENCE

- table_absence : liste objet bubble type option set, à traiter comme un objet option set. On prend le display, l'ID d'un OS n'existe pas. Permet d'avoir en dynamique les entete de la zone absence.


## POSTE ZONE ATELIER

- table_poste_atelier : liste objet bubble type option set, à traiter comme un objet option set. On prend le display, l'ID d'un OS n'existe pas. Permet d'avoir en dynamique la liste des postes.

## Ensemble du planning toute zone confondue. Pour pouvoir populer les zones du plannings et chaque colonne.

- table_pla : liste objet bubble planning_journalier à traiter comme un objet bubble. Permet d'avoir tous les plannings du jour qu'on ventilera dans les zones.
- field_pla_cha : liste des chantiers sur ce planning. relation avec la table chantier. Liste d'objet Bubble.
- field_pla_commentaire : type texte, commentaire du planning pour la zone commentaire.
- field_pla_equipe : liste objet bubble user à traiter comme un objet bubble. Permet d'avoir tous les equipiers.
- field_pla_motif_absence : objet bubble type option set, à traiter comme un objet option set. On prend le display, l'ID d'un OS n'existe pas. Permet de savoir dans quelle colonne positionner l'équipe.
- field_pla_poste_atelier : objet bubble type option set, à traiter comme un objet option set. On prend le display, l'ID d'un OS n'existe pas. Permet de savoir dans quelle poste mettre l'équipe.
- field_pla_stt : liste objet bubble contact à traiter comme un objet bubble. Permet d'avoir tous les sous-traitants.
- field_pla_type : Objet bubble type option set, à traiter comme un objet option set. On prend le display, l'ID d'un OS n'existe pas. Le field le plus important permet de savoir dans quelle zone placer l'équipe.
- field_pla_vehicule : relation table vehicule, à traiter comme un objet bubble. Permet de positionner le vehicule.

En conclusion : le field_pla_type permet de savoir pour positionner l'équipe du planning. 
Par exemple, si c'est Absence alors il y aura un motif, sinon ca sera nulle.



# States

- selected_date : type date. Mis à jour à chaque changement de date. Au chargement du plug in, il prend la valeur de la properties day_date.
- tag_user : objet bubble type user. Quand un tag equipier est drag on expose ce state avec l'objet user en qestion.
- tag_contact : objet bubble type contact. Quand un tag sous-traitant est drag on expose ce state avec l'objet contact en qestion.
- tag_vehicule : objet bubble type vehicule. Quand un tag vehicule est drag on expose ce state avec l'objet vehicule en qestion.
- tag_chantier : objet bubble type chantier. Quand un tag chantier est drag on expose ce state avec l'objet chantier en qestion.

Note 1 : quand un state tag_xxx est exposé, les autres sont reset à null.

- source_zone : type texte, ca sera POOL, CHANTIER, TRANSPORT, ATELIER, BUREAU, ABSENCE
- drop_zone : type texte, ca sera POOL, CHANTIER, TRANSPORT, ATELIER, BUREAU, ABSENCE

Note 2 : A chaque déplacement de tag il faut déclencher "source_zone" et "drop_zone" pour qu'on sache quoi faire en BDD.
Pareil quand on clique sur la croix pour retirer un tag par exemple.
Pareil quand on ajoute un chantier via le drop down juste il y aura pas de source
Quand on retire un chantier qui a été ajouté par le dropdown alors on peut dire que la drop_zone est POOL, on le taitera comme un retour, mai ce dernier ne s'affichera pas dans le pool bien entendu.

- motif_absence : objet option set, qui renvoie le motif d'absence lors du drop du tag user
- poste_atelier : objet option set, qui renvoie le poste atelier selectionne


# Event

- date_changed : à déclencher quand on change de date
- add_commentaire : à déclencher qd on valide un commentaire en sortant de la zone de saisie
- tag_moved : à déclencher à chaque mouvement de tag qui déclenche un changement de "drop_zone" et "source_zone"
- chantier_added : à délcencher quand un chantier est ajouté grâce au drop down
- poste_changed : declencher quand un poste est changé
- copy_planning : qd on clique sur le bouton de duplication global
- copy_zone_chantier: qd on clique sur le bouton de duplication de la zone chantier
- copy_zone_transport : qd on clique sur le bouton de duplication de la zone transport
- copy_zone_atelier : qd on clique sur le bouton de duplication de la zone atelier
- copy_zone_bureau : qd on clique sur le bouton de duplication de la zone bureau