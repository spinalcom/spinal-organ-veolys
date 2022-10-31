# spinal-organ-veolys

## What is this ?

- This is a connector whose purpose is to connect the BOS to the Veolys API server. No VPN or special connection method is required except the IDs and Passwords for both the BOS and Veolys.

- This connector has two jobs :
  - To send the BOS data (tickets) to Veolys
  - To receive the Veolys data (tickets) and send it to the BOS.

- The pull interval is the time between each synchronization (recieving and sending tickets). Can be changed in the studio interface.
  

## How to use it ?

- First, you need a .env file. You can copy the env_example file and rename it to ".env". Then, you need to fill the .env file with the correct values.

- Then, you need to install the dependencies with `npm install`.

- Then, you need to build with `npm run build` or `tsc`.

- Finally, you need to start the connector with `npm run run`.


### Studio

- In the studio you need to create a Ticket context containing the following steps (in this order) : 
    - Acceptation
    - En réparation
    - Réparé
    - Terminé
    - Gelé

- After creating the Ticket context you can create the processes/domains needed to use the connector.
- The following list is all the processes that need to be created with the exact same name and spacing : 
    - _Ascenseur
    - Escalier mécanique
    - GPA - GBF
    - Climatisation chauffage
    - Clos / Couvert
    - Contrôle d'accès - Intrusion
    - Décoration / Second Oeuvre
    - Détection - Extinction incendie
    - Electricité
    - Espaces verts
    - Gestion des badges
    - Plomberie
    - Portes automatiques
    - Porte / Fenêtre / Store
    - Vidéo surveillance
    - Nettoyage
    - Portique
    - Salage / Déneigement
    - Interphonie
    - Alarme - Intrusion

- With that done, you can now proceed to link the connector with this ticket context. Click on the name of your ticket context. On the side bar, you should be able to see the button : "Link And Manage Veolys Connector". After clicking on it, you should be able to see a panel that allows you to change the configuration of the connector ( such as the pull interval, the API id and pass etc...)


