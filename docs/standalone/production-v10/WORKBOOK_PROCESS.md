# Bible V10 — construction et vérification

Le générateur `build-bible-v10.mjs` ajoute les vues **Production V10** et **Cibles V10** à la bible V9. Les nouveaux contenus sont créés avec Artifact Tool dans un répertoire temporaire. Le script de packaging conserve à l’octet les 50 feuilles et 59 tableaux historiques.

## Entrées

- `delivery-register.json` contient les dessins retenus, leurs fichiers, les références et les compteurs. Chaque base entière porte un `productionIdentityId` unique et la liste des IDs réellement couverts.
- Les masters PNG, exports WebP et miniatures doivent correspondre aux empreintes du registre.
- Le registre V9 et la bible V9 servent de point de départ. Le générateur refuse un historique modifié.
- Le mode final exige un registre final, une QA technique réussie et la preuve de contrôle en jeu de chaque dessin livré.

## Exécution

Définir le chemin du dépôt et un dossier de sortie situé dans l’espace de travail de la conversation. Employer le Node et les dépendances du runtime primaire. L’import de la bibliothèque se fait par un lien `node_modules` dans le répertoire temporaire, sans modifier les dépendances du dépôt.

```bash
infernal_repo=/chemin/hellbound-hotel-manager
infernal_output=/chemin/espace-de-travail/outputs/infernal-v10

"$CODEX_PRIMARY_RUNTIME_NODE" --max-old-space-size=1024 \
  "$infernal_repo/docs/standalone/production-v10/build-bible-v10.mjs" \
  --prepare --repo "$infernal_repo" \
  --work-dir /tmp/infernal-v10/workbook \
  --output-dir "$infernal_output"
```

Après la validation du registre, remplacer `--prepare` par `--final`. Le script exporte les ajouts, les réimporte, rend les plages modifiées, assemble le classeur cumulatif et le relit. Il copie le résultat dans `docs/standalone/INFERNAL_VERSUS_BIBLE_V10.xlsx`.

Lire ensuite toutes les images du dossier temporaire `previews/`. Consigner cette inspection dans `workbook-qa.json` sans transformer l’export réussi en validation artistique ou en preuve d’exécution du jeu.

## Contrôles appliqués

Les compteurs sont réconciliés avec les actifs acceptés. Les formules de total sont recalculées après des modifications temporaires du nombre de fichiers, de la catégorie de révision et du nombre de bases, puis les valeurs originales sont rétablies. Les erreurs de formule sont recherchées dans les deux nouvelles feuilles. Le packaging contrôle les feuilles et tableaux historiques, les noms de tableaux et les relations du classeur.

L’export de préparation du 26 novembre a réussi lorsqu’il était isolé des tests/builds du jeu. Le maximum observé aux points de mesure du générateur était de 388 Mo de mémoire résidente. Ce chiffre est un relevé ponctuel, pas une mesure du pic intégral. Le premier essai historique interrompu avec code 137 reste documenté dans `workbook-attempts.json`.

## Préparer la prochaine édition

Pour une V11, créer un script d’édition à partir de ce générateur, puis modifier explicitement le nom de l’édition, la bible et le registre de départ, leurs empreintes vérifiées, les compteurs attendus et les noms uniques des nouvelles feuilles et tableaux. Le point de départ sera **52 feuilles et 61 tableaux** si la V10 finale est conservée telle quelle. Le script d’assemblage peut être réutilisé. Les tests et affirmations de contrôle visuel doivent provenir du nouveau lot.

La V11 n’est ni produite ni validée par la simple préparation de cette procédure.
