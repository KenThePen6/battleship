# Battleship

A Battleship game in two forms:

1. **C# / .NET 8 console app** — the original, built with an object-oriented design (Factory pattern, ship models, fleet loading from files).
2. **Browser rebuild** (`/web`) — the same core rules with a full graphical UI: drag-free click placement, a computer opponent, and hit/miss/sunk tracking.

**▶️ Play the web version:** https://battleship-kenan.vercel.app

---

## Web version (`/web`)

A no-dependency HTML/CSS/JavaScript rebuild that reuses the original rules:

- 10×10 board
- Ships: Carrier (5), Battleship (4), Destroyer (3), Submarine (3), Patrol Boat (2)
- Horizontal placement grows along X, vertical along Y — identical to the C# model
- Place your fleet (or auto-place), then trade shots with a hunt/target AI opponent

Run it locally with any static server, e.g.:

```bash
cd web
python3 -m http.server 8000   # then open http://localhost:8000
```

## Console version (C# / .NET 8)

```bash
dotnet run <fleet-file>
```

**Commands**
- `info` — display the status of all ships
- `X,Y` — fire at a coordinate (e.g. `3,5`)
- `exit` — quit

**Fleet file format** (see `good_fleet1.txt`):

```
Carrier; (0,0); Horizontal
Battleship; (2,2); Vertical
Destroyer; (5,5); Horizontal
Submarine; (7,1); Vertical
Patrol Boat; (9,0); Vertical
```

## Author

**Kenan Al-Khateeb** — Computer Science + Mathematics, East Tennessee State University
[GitHub](https://github.com/KenThePen6) · [LinkedIn](https://www.linkedin.com/in/kenan-al-khateeb/)
