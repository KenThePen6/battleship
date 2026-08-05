using Battleship.Models;
using Battleship.Ships;

namespace Battleship.Factory;

public class ShipFactory
{
    public Ship CreateShip(string line)
    {
        line = line.Trim();

        string[] parts = line.Split(';');

        
        if (parts.Length != 3)
        {
            throw new ArgumentException("Invalid ship format. Expected: Type; (x,y); Direction");
        }


        string type = parts[0].Trim();

        string coordPart = parts[1].Trim();

        coordPart = coordPart.Replace("(", "");
        coordPart = coordPart.Replace(")", "");

        string[] coordPieces = coordPart.Split(',');

        if (coordPieces.Length != 2)
        {
            throw new ArgumentException("Invalid coordinate format.");
        }

        int x = int.Parse(coordPieces[0].Trim());
        int y = int.Parse(coordPieces[1].Trim());

        
        string directionString = parts[2].Trim().ToLower();

        DirectionType direction;

        if (directionString == "horizontal")
            direction = DirectionType.Horizontal;
        else if (directionString == "vertical")
            direction = DirectionType.Vertical;
        else
            throw new ArgumentException("Invalid direction.");


        int length;

        switch (type.ToLower())
        {
            case "carrier":
                length = 5;
                break;
            case "battleship":
                length = 4;
                break;
            case "destroyer":
                length = 3;
                break;
            case "submarine":
                length = 3;
                break;
            case "patrolboat":
            case "patrol boat":
                length = 2;
                break;
            default:
                throw new ArgumentException("Invalid ship type.");
        }

     
        for (int i = 0; i < length; i++)
        {
            int testX = x;
            int testY = y;

            if (direction == DirectionType.Horizontal)
                testX += i;
            else
                testY += i;

            if (testX < 0 || testX > 9 || testY < 0 || testY > 9)
            {
                throw new ArgumentException(
                    $"{type} runs off the board at ({testX},{testY})."
                );
            }
        }

        Coord2D position = new Coord2D(x, y);

        switch (type.ToLower())
        {
            case "carrier":
                return new Carrier(position, direction);
            case "battleship":
                return new Ships.Battleship(position, direction);
            case "destroyer":
                return new Destroyer(position, direction);
            case "submarine":
                return new Submarine(position, direction);
            case "patrolboat":
            case "patrol boat":
                return new PatrolBoat(position, direction);
            default:
                throw new ArgumentException("Invalid ship type.");
        }
    }
}