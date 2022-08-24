# Conception.MD 
## _Traitement de l'issue 82_
#### _"Add documentation for custom hooks"_
La finalité de cette issue est de proposer une documentation storybook pour les hooks customs suivants :

- useRtL

## Résolution

Tout d'abord, je vais créer un fichier "docs.stories.tsx" sous src/hooks tel que l'on ait :
src/hooks/
├── docs.stories.tsx
└── useRtl.ts

Je dois ensuite comprendre ce que fait ce hook:  
Il permet d'identifier la configuration "RTL" (right to left) pour ainsi changer le comportement et l'orientation de composants basés/calculés/soumis à une direction... par exemple le menu hamburger de la page. Si je reformule, il permet de vérifier la direction souhaitée.

La direction peut être de droite à gauche (rtl) ou de gauche à droite (ltr). Cette direction change notamment quand la langue arabe est utilisée dans l'application d'où l'intérêt de pouvoir récupérer cette direction via le hook useRtL.    .  

Je pense qu'il faudrait présenter l'utilisation de useRtL selon que la valeur soit rtl ou ltr.
Je pense également qu'il pourrait être nécessaire de présenter le menu hamburger suivant que le useRtL ait renvoyé rtl ou ltr.
Je m'inspirerais de l'architecture des docs déjà présentes dans le projet pour écrire la mienne.  
Par exemple, [ce fichier](https://github.com/BearStudio/start-ui-web/blob/master/src/components/ActionsButton/docs.stories.tsx) docs.stories.tsx.  
