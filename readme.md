## Anleitung zum Bauen und Ausführen

```
docker-compose up --build
```

...im Root-Ördner des Repository ausführen. Danach ist die Anwendung über

```
localhost:5173
```

im Browser aufrufbar. Auf der Datenbank befinden sich bereits folgende zwei Spieler, mit denen man sich anmelden und gegeneinander antreten kann:
|Nutzername|Passwort|
|--------|--------|
| User1 | User1!User1! |
| User2 | User1!User1! |

Zum Testen wird empfohlen, zwei unterschiedliche Webbrowser zu verwenden.

Da es im Moment noch Probleme mit dem Disposen des Gameclients gibt, ist die Webanwendung nach dem erfolgreichen Beendigen eines Spiels erneut zu laden, um ein neues Spiel zu starten.

Um das Spiel einfach lokal testen zu können, ist die maximale Spieleranzahl derzeit auf zweibegrenzt. Diese kann über zwei globale Konstanten (maxNumberÖfPlayers) auch noch nachträglich verändert werden.

Viel Spaß!
