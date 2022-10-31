/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

// tslint:disable:max-line-length
import { axiosInstance } from '../../utils/axiosInstance';

// DICree : Enregistre une demande d'intervention.
// Il est également possible de joindre des pièces jointes et des signatures.

// Point d'entrée : https://www.api.alteva.eu:444/APIAlteva/DICree
// Méthode : POST

// Paramètres entrants :
// 	- chNumSession*			: Identifiant de la session en cours. Doit au préalable être récupéré via la méthode Authentification.(voir fichier CreationSession.txt)
// 	- chLoginAppelant*-**	: Login de l'appelant de la demande.
// 	- chNomAppelant			: Nom de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
// 	- chPrenomAppelant		: Prénom de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
// 	- chTelAppelant			: Téléphone de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
// 	- chAdresseAppelant		: Adresse de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
// 	- chDomaine**			: Domaine de la demande. La clé unique ou le libellé peuvent être utilisés. Si non spécifié, le domaine par défaut sera utilisé.
// 	- chObjet*				: Objet de la demande. Si un objet existant dans la base est utilisé, le domaine lié sera utilisé si celui-ci n'a pas été spécifié.
// 	- chCateg				: Code de la catégorie de la demande. Si non spécifié, la catégorie par défaut pour les demandes sera utilisée.
// 	- chIdMat**				: IdMat du matériel concerné par la demande.
// 	- chLocal*-**			: Local de la demande. Les valeurs suivantes, dans cet ordre de priorité, peuvent être utilisées : la clé unique, le libellé complet, l'Id.Local
// 	- chCentreTech**		: Centre technique de la demande. La clé unique ou le libellé complet, dans cet ordre de priorité, peuvent être utilisés. Si non spécifié, cette valeur sera héritée de l'appelant, du local ou du matériel.
// 	- chCentreFrais**		: Centre financier de la demande. La clé unique ou le libellé complet, dans cet ordre de priorité, peuvent être utilisés. Si non spécifié, cette valeur sera héritée de l'appelant, du local ou du matériel.
// 	- chArboLibre**			: L'arbo libre de la demande. La clé unique ou le libellé complet, dans cet ordre de priorité, peuvent être utilisés. Si non spécifié, cette valeur sera héritée de l'appelant, du local ou du matériel.
// 	- chRefInt				: Référence interne de la demande.
// 	- boSansDoublonRefInt	: Booléen permettant d'empêcher la création de la demande s'il existe déjà une demande avec la même référence interne. 0 (par défaut) : doublons autorisés, 1 : doublons interdits
// 	- chRefInt2				: Seconde référence interne de la demande.
// 	- boSansDoublonRefInt2	: Booléen permettant d'empêcher la création de la demande s'il existe déjà une demande avec la même référence interne 2. 0 (par défaut) : doublons autorisés, 1 : doublons interdits
// 	- chLoginIT				: Login Mission de l'intervenant créant la demande. Si non spécifié, l'intervenant lié au login appelant le webservice est utilisé.
// 	- chDateDemande			: Date de la demande (au format AAAAMMJJ). Si non spécifié, la date système sera utilisée.
// 	- chHeureDemande		: Heure de la demande (au format HHMM). Si non spécifié, l'heure système sera utilisée.
// 	- chDatePrevue			: Date prévue d'intervention (au format AAAAMMJJ).
// 	- chHeurePrevue			: Heure prévue d'intervention (au format HHMM).
// 	- chDateAvantLe			: Date de début de première intervention (au format AAAAMMJJ). Écrase l'éventuelle date calculée par les RAD si spécifié.
// 	- chHeureAvantLe		: Heure de début de première intervention (au format HHMM). Écrase l'éventuelle heure calculée par les RAD si spécifié.
// 	- chDateREP				: Date limite de remise en service provisoire (au format AAAAMMJJ). Écrase l'éventuelle date calculée par les RAD si spécifié.
// 	- chHeureREP			: Heure limite de remise en service provisoire (au format HHMM). Écrase l'éventuelle heure calculée par les RAD si spécifié.
// 	- chDateRED				: Date limite de remise en service définitive (au format AAAAMMJJ). Écrase l'éventuelle date calculée par les RAD si spécifié.
// 	- chHeureRED			: Heure limite de remise en service définitive (au format HHMM). Écrase l'éventuelle heure calculée par les RAD si spécifié.
// 	- chDetail*				: Détail de la demande.
// 	- enPriorite			: Priorité de la demande, au format entier de 1 (Urgent) à 3 (A l'occasion). Si non spécifié, sera fixée à 2 (Priorité normale).
// 	- PiecesJointes			: Structure à dupliquer autant de fois qu'il y a de pièces jointes.
// 			- chNomPJ*			: Nom et extension de la PJ.
// 			- chDataPJ*			: Données du fichier joint. Peuvent être encodées en binaire, ASCII, BASE64(de préférence) ou UUEncode.
// 			- chCommentaire		: Commentaire associé à la PJ.

// 	*	Paramètres obligatoires
// 	**	Des restrictions sont appliquées sur cet élément.

// Paramètres sortants :
// 	- enNumDI		: Numéro de la DI créée.
// 	- chErreursNonBloquantes : Descriptif des erreurs non bloquantes s'il en est survenu. Ces erreurs n'empêchent pas la création du CR mais peuvent par exemple indiquer qu'une PJ n'a pas pu être intégrée.

export interface IDICree {
  chNumSession: string;
  chLoginAppelant;
  chNomAppelant?;
  chPrenomAppelant?;
  chTelAppelant?;
  chAdresseAppelant?;
  chDomaine;
  chObjet;
  chCateg?;
  chIdMat?;
  chLocal;
  chCentreTech?;
  chCentreFrais?;
  chArboLibre?;
  chRefInt?;
  boSansDoublonRefInt?;
  chRefInt2?;
  boSansDoublonRefInt2?;
  chLoginIT?;
  chDateDemande?;
  chHeureDemande?;
  chDatePrevue?;
  chHeurePrevue?;
  chDateAvantLe?;
  chHeureAvantLe?;
  chDateREP?;
  chHeureREP?;
  chDateRED?;
  chHeureRED?;
  chDetail;
  enPriorite?;
  PiecesJointes?: {
    chNomPJ: any;
    chDataPJ: string;
    chCommentaire?: string;
  }[];
}

/**
 * @export
 * @interface IDICreeRes
 */
export interface IDICreeRes {
  enNumDI: number;
  chErreursNonBloquantes: any;
}

/**
 * Paramètres entrants :
 * ```txt
chNumSession*			: Identifiant de la session en cours. Doit au préalable être récupéré via la méthode Authentification.(voir fichier CreationSession.txt)
chLoginAppelant*-**	: Login de l'appelant de la demande.
chNomAppelant			: Nom de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
chPrenomAppelant		: Prénom de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
chTelAppelant			: Téléphone de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
chAdresseAppelant		: Adresse de l'appelant de la demande. Ne met pas à jour la fiche de l'appelant, est seulement présent dans la demande à titre indicatif.
chDomaine**			: Domaine de la demande. La clé unique ou le libellé peuvent être utilisés. Si non spécifié, le domaine par défaut sera utilisé.
chObjet*				: Objet de la demande. Si un objet existant dans la base est utilisé, le domaine lié sera utilisé si celui-ci n'a pas été spécifié.
chCateg				: Code de la catégorie de la demande. Si non spécifié, la catégorie par défaut pour les demandes sera utilisée.
chIdMat**				: IdMat du matériel concerné par la demande.
chLocal*-**			: Local de la demande. Les valeurs suivantes, dans cet ordre de priorité, peuvent être utilisées : la clé unique, le libellé complet, l'Id.Local
chCentreTech**		: Centre technique de la demande. La clé unique ou le libellé complet, dans cet ordre de priorité, peuvent être utilisés. Si non spécifié, cette valeur sera héritée de l'appelant, du local ou du matériel.
chCentreFrais**		: Centre financier de la demande. La clé unique ou le libellé complet, dans cet ordre de priorité, peuvent être utilisés. Si non spécifié, cette valeur sera héritée de l'appelant, du local ou du matériel.
chArboLibre**			: L'arbo libre de la demande. La clé unique ou le libellé complet, dans cet ordre de priorité, peuvent être utilisés. Si non spécifié, cette valeur sera héritée de l'appelant, du local ou du matériel.
chRefInt				: Référence interne de la demande.
boSansDoublonRefInt	: Booléen permettant d'empêcher la création de la demande s'il existe déjà une demande avec la même référence interne. 0 (par défaut) : doublons autorisés, 1 : doublons interdits
chRefInt2				: Seconde référence interne de la demande.
boSansDoublonRefInt2	: Booléen permettant d'empêcher la création de la demande s'il existe déjà une demande avec la même référence interne 2. 0 (par défaut) : doublons autorisés, 1 : doublons interdits
chLoginIT				: Login Mission de l'intervenant créant la demande. Si non spécifié, l'intervenant lié au login appelant le webservice est utilisé.
chDateDemande			: Date de la demande (au format AAAAMMJJ). Si non spécifié, la date système sera utilisée.
chHeureDemande		: Heure de la demande (au format HHMM). Si non spécifié, l'heure système sera utilisée.
chDatePrevue			: Date prévue d'intervention (au format AAAAMMJJ).
chHeurePrevue			: Heure prévue d'intervention (au format HHMM).
chDateAvantLe			: Date de début de première intervention (au format AAAAMMJJ). Écrase l'éventuelle date calculée par les RAD si spécifié.
chHeureAvantLe		: Heure de début de première intervention (au format HHMM). Écrase l'éventuelle heure calculée par les RAD si spécifié.
chDateREP				: Date limite de remise en service provisoire (au format AAAAMMJJ). Écrase l'éventuelle date calculée par les RAD si spécifié.
chHeureREP			: Heure limite de remise en service provisoire (au format HHMM). Écrase l'éventuelle heure calculée par les RAD si spécifié.
chDateRED				: Date limite de remise en service définitive (au format AAAAMMJJ). Écrase l'éventuelle date calculée par les RAD si spécifié.
chHeureRED			: Heure limite de remise en service définitive (au format HHMM). Écrase l'éventuelle heure calculée par les RAD si spécifié.
chDetail*				: Détail de la demande.
enPriorite			: Priorité de la demande, au format entier de 1 (Urgent) à 3 (A l'occasion). Si non spécifié, sera fixée à 2 (Priorité normale).
PiecesJointes			: Structure à dupliquer autant de fois qu'il y a de pièces jointes.
  - chNomPJ*			: Nom et extension de la PJ.
  - chDataPJ*			: Données du fichier joint. Peuvent être encodées en binaire, ASCII, BASE64(de préférence) ou UUEncode.
  - chCommentaire		: Commentaire associé à la PJ.
```
 */
export function diCree(obj: IDICree): Promise<IDICreeRes> {
  console.log('SEND DICree', obj);
  // // DEBUG
  // return Promise.resolve({
  //   enNumDI: 14,
  //   chErreursNonBloquantes: [],
  // });

  return axiosInstance.post('APIAlteva/DICree', obj).then((res) => res.data);
}
